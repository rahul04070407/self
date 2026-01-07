import { Component, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../core/services/db.service';
import { Transaction, EMI } from '../../core/models/finance.model';
import { RouterLink } from '@angular/router';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    CommonModule,
    RouterLink,
    BaseChartDirective,
    FormsModule
  ],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css'
})
export class DashboardComponent implements OnInit {
  transactions: Transaction[] = [];
  emis: EMI[] = [];
  today = new Date();

  // Calendar State
  currentViewDate = signal(new Date());
  calendarDays: { date: Date; income: number; expense: number; isCurrentMonth: boolean; isToday: boolean }[] = [];
  weekDays = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

  // Year Analysis
  selectedYear = new Date().getFullYear();
  years: number[] = [];
  showYearMenu = false;

  // Stats
  totalBalance = 0;
  monthlyIncome = 0;
  monthlyExpense = 0;
  monthlyDue = 0;

  public lineChartData: ChartData<'line'> = { labels: [], datasets: [] };
  public lineChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: { legend: { display: false } },
    scales: { x: { display: false }, y: { display: false } }
  };

  public pieChartData: ChartData<'pie'> = { labels: [], datasets: [] };

  constructor(private db: DbService) { }

  async ngOnInit() {
    await this.loadData();
    this.generateYears();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  async loadData() {
    this.transactions = await this.db.getTransactions();
    this.emis = await this.db.getEMIs();
    this.calculateStats();
    this.initCharts();
    this.generateCalendar();
  }

  onYearChange() {
    const newDate = new Date(this.currentViewDate());
    newDate.setFullYear(Number(this.selectedYear));
    this.currentViewDate.set(newDate);

    this.calculateStats();
    this.initCharts();
    this.generateCalendar();
  }

  calculateStats() {
    const now = new Date();
    const yearFiltered = this.transactions.filter(t => new Date(t.date).getFullYear() === Number(this.selectedYear));

    const totalIncome = this.transactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    const totalExpense = this.transactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
    this.totalBalance = totalIncome - totalExpense;

    // Monthly stats (for selected month in calendar)
    const viewMonth = this.currentViewDate().getMonth();
    const viewYear = this.currentViewDate().getFullYear();

    const monthTransactions = this.transactions.filter(t => {
      const d = new Date(t.date);
      return d.getMonth() === viewMonth && d.getFullYear() === viewYear;
    });

    this.monthlyIncome = monthTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0);
    this.monthlyExpense = monthTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0);

    this.monthlyDue = this.emis
      .filter(e => {
        const start = new Date(e.startDate);
        const end = new Date(start);
        end.setMonth(end.getMonth() + e.durationMonths);
        return viewYear >= start.getFullYear() && viewYear <= end.getFullYear() && e.paidMonths < e.durationMonths;
      })
      .reduce((s, e) => s + e.monthlyAmount, 0);
  }

  generateCalendar() {
    const date = this.currentViewDate();
    const year = date.getFullYear();
    const month = date.getMonth();

    const firstDay = new Date(year, month, 1).getDay();
    const daysInMonth = new Date(year, month + 1, 0).getDate();

    const prevMonthLastDay = new Date(year, month, 0).getDate();

    const days = [];

    // Prev month days
    for (let i = firstDay; i > 0; i--) {
      const d = new Date(year, month - 1, prevMonthLastDay - i + 1);
      days.push(this.createDayObject(d, false));
    }

    // Current month days
    for (let i = 1; i <= daysInMonth; i++) {
      const d = new Date(year, month, i);
      days.push(this.createDayObject(d, true));
    }

    // Next month days
    const remainingSlots = 42 - days.length;
    for (let i = 1; i <= remainingSlots; i++) {
      const d = new Date(year, month + 1, i);
      days.push(this.createDayObject(d, false));
    }

    this.calendarDays = days;
  }

  createDayObject(date: Date, isCurrentMonth: boolean) {
    const dateStr = date.toISOString().split('T')[0];
    const dayTransactions = this.transactions.filter(t => new Date(t.date).toISOString().split('T')[0] === dateStr);

    return {
      date,
      income: dayTransactions.filter(t => t.type === 'income').reduce((s, t) => s + t.amount, 0),
      expense: dayTransactions.filter(t => t.type === 'expense').reduce((s, t) => s + t.amount, 0),
      isCurrentMonth,
      isToday: new Date().toISOString().split('T')[0] === dateStr
    };
  }

  changeMonth(delta: number) {
    const newDate = new Date(this.currentViewDate());
    newDate.setMonth(newDate.getMonth() + delta);
    this.currentViewDate.set(newDate);
    this.selectedYear = newDate.getFullYear();
    this.calculateStats();
    this.initCharts();
    this.generateCalendar();
  }

  initCharts() {
    const yearFiltered = this.transactions.filter(t => new Date(t.date).getFullYear() === Number(this.selectedYear));
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const incomeData = months.map((_, i) =>
      yearFiltered.filter(t => t.type === 'income' && new Date(t.date).getMonth() === i).reduce((s, t) => s + t.amount, 0)
    );
    const expenseData = months.map((_, i) =>
      yearFiltered.filter(t => t.type === 'expense' && new Date(t.date).getMonth() === i).reduce((s, t) => s + t.amount, 0)
    );

    this.lineChartData = {
      labels: months,
      datasets: [
        { data: incomeData, label: 'Income', borderColor: '#10b981', backgroundColor: 'rgba(16, 185, 129, 0.1)', fill: true, tension: 0.4 },
        { data: expenseData, label: 'Expense', borderColor: '#ef4444', backgroundColor: 'rgba(239, 68, 68, 0.1)', fill: true, tension: 0.4 }
      ]
    };

    const expenses = yearFiltered.filter(t => t.type === 'expense');
    const categories = [...new Set(expenses.map(t => t.category))];
    this.pieChartData = {
      labels: categories,
      datasets: [{
        data: categories.map(c => expenses.filter(t => t.category === c).reduce((s, t) => s + t.amount, 0)),
        backgroundColor: ['#6366f1', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4']
      }]
    };
  }

  getRecentTransactions() {
    return this.transactions
      .filter(t => new Date(t.date).getFullYear() === Number(this.selectedYear))
      .slice(0, 5);
  }
}
