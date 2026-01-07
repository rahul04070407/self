import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../core/services/db.service';
import { Transaction } from '../../core/models/finance.model';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';
import Swal from 'sweetalert2';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [CommonModule, FormsModule, AddTransactionComponent],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.css'
})
export class TransactionsComponent implements OnInit {
  transactions: Transaction[] = [];
  editingTransaction: Transaction | null = null;
  showAddForm = false;

  incomeCategories = ['rahul salary', 'rana salary', 'car income', 'tution income', 'other'];
  expenseCategories = [
    'emi', 'credit card', 'home', 'food', 'my daily expence',
    'rahul bike fuel', 'rana bike fuel', 'baba car expence',
    'home medicine', 'home work', 'other'
  ];

  constructor(
    private db: DbService,
    private toastr: ToastrService
  ) { }

  async ngOnInit() {
    await this.loadTransactions();
  }

  get currentCategories() {
    if (!this.editingTransaction) return [];
    return this.editingTransaction.type === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  async loadTransactions() {
    this.transactions = (await this.db.getTransactions()).sort((a, b) =>
      new Date(b.date).getTime() - new Date(a.date).getTime()
    );
  }

  async deleteTransaction(id: number | undefined) {
    if (!id) return;

    const result = await Swal.fire({
      title: 'Are you sure?',
      text: "This transaction will be permanently deleted!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#6366f1',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'Yes, delete it!',
      background: '#1e293b',
      color: '#f8fafc'
    });

    if (result.isConfirmed) {
      await this.db.deleteTransaction(id);
      await this.loadTransactions();
      this.toastr.success('Transaction deleted successfully');
    }
  }

  startEdit(t: Transaction) {
    this.editingTransaction = { ...t };
    this.showAddForm = false;
  }

  async saveEdit() {
    if (this.editingTransaction && this.editingTransaction.id) {
      await this.db.updateTransaction({ ...this.editingTransaction });
      this.editingTransaction = null;
      await this.loadTransactions();
      this.toastr.success('Transaction updated successfully');
    }
  }

  cancelEdit() {
    this.editingTransaction = null;
  }

  onTransactionAdded() {
    this.loadTransactions();
    this.showAddForm = false;
    this.toastr.success('New transaction added!');
  }

  getCategoryIcon(category: string): string {
    const cat = category.toLowerCase();
    if (cat.includes('salary')) return 'bi-cash-stack';
    if (cat.includes('fuel')) return 'bi-fuel-pump-fill';
    if (cat.includes('food')) return 'bi-egg-fried';
    if (cat.includes('medicine')) return 'bi-capsule';
    if (cat.includes('emi') || cat.includes('card')) return 'bi-credit-card-2-front-fill';
    if (cat.includes('home')) return 'bi-house-fill';
    if (cat.includes('tution')) return 'bi-book-fill';
    if (cat.includes('car')) return 'bi-car-front-fill';
    return 'bi-dot';
  }
}
