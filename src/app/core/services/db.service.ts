import { Injectable } from '@angular/core';
import Dexie, { Table } from 'dexie';
import { Transaction, EMI } from '../models/finance.model';

@Injectable({
    providedIn: 'root'
})
export class DbService extends Dexie {
    transactions!: Table<Transaction, number>;
    emis!: Table<EMI, number>;

    constructor() {
        super('FinFlowDB');
        this.version(1).stores({
            transactions: '++id, type, category, date',
            emis: '++id, name, category'
        });

        this.on('populate', () => {
            const now = new Date();
            this.transactions.bulkAdd([
                { type: 'income', category: 'rahul salary', amount: 45000, date: now, note: 'Primary Income' },
                { type: 'income', category: 'rana salary', amount: 35000, date: now, note: 'Business Income' },
                { type: 'expense', category: 'food', amount: 1500, date: now, note: 'Monthly Groceries' },
                { type: 'expense', category: 'emi', amount: 12000, date: now, note: 'Home Loan Installment' },
                { type: 'expense', category: 'rahul bike fuel', amount: 1200, date: now, note: 'Fuel' }
            ]);
            this.emis.add({
                name: 'SBI Home Loan',
                totalAmount: 1500000,
                monthlyAmount: 12000,
                startDate: new Date(now.getFullYear(), 0, 1),
                durationMonths: 180,
                paidMonths: 6,
                category: 'Loan'
            });
        });
    }

    // Transactions API
    async addTransaction(transaction: Transaction) {
        return await this.transactions.add(transaction);
    }

    async getTransactions() {
        return await this.transactions.orderBy('date').reverse().toArray();
    }

    async updateTransaction(transaction: Transaction) {
        if (!transaction.id) return;
        return await this.transactions.put(transaction);
    }

    async deleteTransaction(id: number) {
        return await this.transactions.delete(id);
    }

    // EMIs API
    async addEMI(emi: EMI) {
        return await this.emis.add(emi);
    }

    async getEMIs() {
        return await this.emis.toArray();
    }

    async updateEMI(emi: EMI) {
        if (!emi.id) return;
        return await this.emis.put(emi);
    }

    async updateEMIProgress(id: number, paidMonths: number) {
        return await this.emis.update(id, { paidMonths });
    }

    async deleteEMI(id: number) {
        return await this.emis.delete(id);
    }
}
