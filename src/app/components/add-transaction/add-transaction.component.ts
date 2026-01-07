import { Component, EventEmitter, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DbService } from '../../core/services/db.service';
import { Transaction } from '../../core/models/finance.model';

@Component({
  selector: 'app-add-transaction',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './add-transaction.component.html',
  styleUrl: './add-transaction.component.css'
})
export class AddTransactionComponent {
  @Output() transactionAdded = new EventEmitter<void>();

  transaction: Transaction = {
    type: 'expense',
    category: '',
    amount: 0,
    date: new Date(),
    note: ''
  };

  incomeCategories = ['rahul salary', 'rana salary', 'car income', 'tution income', 'other'];
  expenseCategories = [
    'emi', 'credit card', 'home', 'food', 'my daily expence',
    'rahul bike fuel', 'rana bike fuel', 'baba car expence',
    'home medicine', 'home work', 'other'
  ];

  constructor(private db: DbService) { }

  get currentCategories() {
    return this.transaction.type === 'income' ? this.incomeCategories : this.expenseCategories;
  }

  async onSubmit() {
    if (this.transaction.amount <= 0 || !this.transaction.category) return;

    this.transaction.date = new Date(this.transaction.date);
    await this.db.addTransaction({ ...this.transaction });
    this.resetForm();
    this.transactionAdded.emit();
  }

  resetForm() {
    this.transaction = {
      type: 'expense',
      category: '',
      amount: 0,
      date: new Date(),
      note: ''
    };
  }
}
