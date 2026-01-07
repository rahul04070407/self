import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../core/services/db.service';
import { EMI } from '../../core/models/finance.model';

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

  newEMI: EMI = {
    name: '',
    totalAmount: 0,
    monthlyAmount: 0,
    startDate: new Date(),
    durationMonths: 12,
    paidMonths: 0,
    category: 'Loan'
  };

  constructor(private db: DbService) { }

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
    }
  }

  async deleteEMI(id: number | undefined) {
    if (id && confirm('Delete this EMI?')) {
      await this.db.deleteEMI(id);
      await this.loadEMIs();
    }
  }

  async updateProgress(emi: EMI, change: number) {
    const newVal = Math.max(0, Math.min(emi.durationMonths, emi.paidMonths + change));
    if (emi.id) {
      await this.db.updateEMIProgress(emi.id, newVal);
      await this.loadEMIs();
    }
  }

  getProgressPercentage(emi: EMI): number {
    return (emi.paidMonths / emi.durationMonths) * 100;
  }

  getRemainingMonths(emi: EMI): number {
    return emi.durationMonths - emi.paidMonths;
  }

  resetForm() {
    this.newEMI = { name: '', totalAmount: 0, monthlyAmount: 0, startDate: new Date(), durationMonths: 12, paidMonths: 0, category: 'Loan' };
  }
}
