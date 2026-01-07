import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../core/services/db.service';
import { Transaction } from '../../core/models/finance.model';
import { AddTransactionComponent } from '../add-transaction/add-transaction.component';

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

  constructor(private db: DbService) { }

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
    if (id && confirm('Delete this record?')) {
      await this.db.deleteTransaction(id);
      await this.loadTransactions();
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
    }
  }

  cancelEdit() {
    this.editingTransaction = null;
  }
}
