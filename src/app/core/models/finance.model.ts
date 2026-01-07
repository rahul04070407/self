export interface Transaction {
  id?: number;
  type: 'income' | 'expense';
  category: string;
  amount: number;
  date: Date;
  note: string;
}

export interface EMI {
  id?: number;
  name: string;
  totalAmount: number;
  monthlyAmount: number;
  startDate: Date;
  durationMonths: number;
  paidMonths: number;
  category: string;
}
