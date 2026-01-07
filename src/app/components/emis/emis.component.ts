import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../core/services/db.service';
import { EMI } from '../../core/models/finance.model';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-emis',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './emis.component.html',
  styleUrl: './emis.component.css'
})
export class EmisComponent implements OnInit {
  emis: EMI[] = [];
  showAddForm = false;
  editingEMI: EMI | null = null;
  selectedYear = new Date().getFullYear();
  years: number[] = [];
  showYearMenu = false;
  categories = ['Rana Bike', 'Rahul Bike', 'Education', 'Car Loan', 'Home Loan', 'Personal Loan', 'Other'];

  newEMI: EMI = {
    name: '',
    totalAmount: 0,
    monthlyAmount: 0,
    startDate: new Date(),
    durationMonths: 12,
    paidMonths: 0,
    category: this.categories[0]
  };

  constructor(
    private db: DbService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    this.generateYears();
    await this.loadEMIs();
  }

  generateYears() {
    const currentYear = new Date().getFullYear();
    for (let i = currentYear; i >= currentYear - 5; i--) {
      this.years.push(i);
    }
  }

  async loadEMIs() {
    this.emis = await this.db.getEMIs();
  }

  // Filter EMIs that are active during the selected year
  get filteredEMIs() {
    return this.emis.filter(e => {
      const start = new Date(e.startDate);
      const end = new Date(start);
      end.setMonth(end.getMonth() + e.durationMonths);
      return this.selectedYear >= start.getFullYear() && this.selectedYear <= end.getFullYear();
    });
  }

  getTotalYearlyCommitment() {
    return this.filteredEMIs.reduce((sum, e) => sum + (e.monthlyAmount * 12), 0);
  }

  async onSubmit() {
    if (this.newEMI.name && this.newEMI.totalAmount > 0) {
      this.newEMI.startDate = new Date(this.newEMI.startDate);
      await this.db.addEMI({ ...this.newEMI });
      this.resetForm();
      await this.loadEMIs();
      this.showAddForm = false;
      this.toastr.success('New EMI plan created!');
    }
  }

  startEdit(emi: EMI) {
    this.editingEMI = { ...emi };
  }

  async saveEdit() {
    if (this.editingEMI && this.editingEMI.id) {
      this.editingEMI.startDate = new Date(this.editingEMI.startDate);
      await this.db.updateEMI(this.editingEMI);
      this.editingEMI = null;
      await this.loadEMIs();
      this.toastr.success('EMI plan updated');
    }
  }

  async deleteEMI(id: number | undefined) {
    if (!id) return;

    const result = await Swal.fire({
      title: 'Remove EMI Plan?',
      text: "All progress data for this EMI will be lost!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, remove it!',
      background: '#1e293b',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      await this.db.deleteEMI(id);
      await this.loadEMIs();
      this.toastr.success('EMI plan removed');
    }
  }

  async updateProgress(emi: EMI, change: number) {
    const newVal = Math.max(0, Math.min(emi.durationMonths, emi.paidMonths + change));
    if (emi.id) {
      await this.db.updateEMIProgress(emi.id, newVal);
      await this.loadEMIs();
      if (change > 0) this.toastr.info('EMI payment logged!');
    }
  }

  getProgressPercentage(emi: EMI): number {
    return (emi.paidMonths / emi.durationMonths) * 100;
  }

  getRemainingMonths(emi: EMI): number {
    return emi.durationMonths - emi.paidMonths;
  }

  resetForm() {
    this.newEMI = { name: '', totalAmount: 0, monthlyAmount: 0, startDate: new Date(), durationMonths: 12, paidMonths: 0, category: this.categories[0] };
  }
}
