import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { DbService } from '../../core/services/db.service';
import { Transaction } from '../../core/models/finance.model';
import { BaseChartDirective } from 'ng2-charts';
import { ChartConfiguration, ChartData } from 'chart.js';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-reports',
  standalone: true,
  imports: [CommonModule, BaseChartDirective, FormsModule],
  templateUrl: './reports.component.html',
  styleUrl: './reports.component.css'
})
export class ReportsComponent implements OnInit {
  transactions: Transaction[] = [];
  today = new Date();
  isLoaded = false;

  // Year Analysis
  selectedYear = new Date().getFullYear();
  years: number[] = [];
  showYearMenu = false;

  public barChartData: ChartData<'bar'> = { labels: [], datasets: [] };
  public barChartOptions: ChartConfiguration['options'] = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        position: 'top',
        labels: { color: '#94a3b8', font: { family: 'Outfit', size: 12 } }
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        cornerRadius: 8,
        padding: 12
      }
    },
    scales: {
      x: {
        ticks: { color: '#94a3b8' },
        grid: { display: false }
      },
      y: {
        ticks: {
          color: '#94a3b8',
          callback: (v) => '₹' + v
        },
        grid: { color: 'rgba(255, 255, 255, 0.05)' }
      }
    }
  };

  public radarChartData: ChartData<'radar'> = {
    labels: ['Savings', 'Investment', 'Spending', 'Budgeting', 'Debt'],
    datasets: [
      {
        data: [65, 59, 90, 81, 56],
        label: 'Financial Health',
        borderColor: '#6366f1',
        backgroundColor: 'rgba(99, 102, 241, 0.2)',
        pointBackgroundColor: '#6366f1',
        pointBorderColor: '#fff',
        pointHoverBackgroundColor: '#fff',
        pointHoverBorderColor: '#6366f1'
      }
    ]
  };

  constructor(private db: DbService) { }

  async ngOnInit() {
    this.generateYears();
    await this.loadData();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  async loadData() {
    this.isLoaded = false;
    this.transactions = await this.db.getTransactions();
    this.processMonthlyData();
    this.isLoaded = true;
  }

  onYearChange() {
    this.processMonthlyData();
  }

  processMonthlyData() {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

    const yearTransactions = this.transactions.filter(t => new Date(t.date).getFullYear() === Number(this.selectedYear));

    const incomeByMonth = new Array(12).fill(0);
    const expenseByMonth = new Array(12).fill(0);

    yearTransactions.forEach(t => {
      const date = new Date(t.date);
      const monthIndex = date.getMonth();
      if (t.type === 'income') incomeByMonth[monthIndex] += t.amount;
      else expenseByMonth[monthIndex] += t.amount;
    });

    this.barChartData = {
      labels: months,
      datasets: [
        {
          data: incomeByMonth,
          label: 'Income',
          backgroundColor: '#10b981',
          borderRadius: 6,
          barThickness: 12
        },
        {
          data: expenseByMonth,
          label: 'Expenses',
          backgroundColor: '#ef4444',
          borderRadius: 6,
          barThickness: 12
        }
      ]
    };
  }
}
