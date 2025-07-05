
export interface Transaction {
  id: string;
  amount: number;
  description: string;
  date: string;
  category: string;
  type: 'income' | 'expense';
}

export interface Budget {
  category: string;
  amount: number;
  spent: number;
}

export const CATEGORIES = [
  'Food & Dining',
  'Transportation',
  'Shopping',
  'Entertainment',
  'Bills & Utilities',
  'Healthcare',
  'Travel',
  'Education',
  'Personal Care',
  'Other'
];

export const CATEGORY_COLORS = {
  'Food & Dining': '#FF6B6B',
  'Transportation': '#4ECDC4',
  'Shopping': '#45B7D1',
  'Entertainment': '#96CEB4',
  'Bills & Utilities': '#FFEAA7',
  'Healthcare': '#DDA0DD',
  'Travel': '#98D8C8',
  'Education': '#F7DC6F',
  'Personal Care': '#BB8FCE',
  'Other': '#85C1E9'
};

export const loadTransactions = (): Transaction[] => {
  const stored = localStorage.getItem('finflow_transactions');
  return stored ? JSON.parse(stored) : [];
};

export const saveTransactions = (transactions: Transaction[]) => {
  localStorage.setItem('finflow_transactions', JSON.stringify(transactions));
};

export const loadBudgets = (): Budget[] => {
  const stored = localStorage.getItem('finflow_budgets');
  return stored ? JSON.parse(stored) : [];
};

export const saveBudgets = (budgets: Budget[]) => {
  localStorage.setItem('finflow_budgets', JSON.stringify(budgets));
};

export const generateId = () => {
  return Date.now().toString(36) + Math.random().toString(36).substr(2);
};

export const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(amount);
};

export const getMonthlyExpenses = (transactions: Transaction[]) => {
  const monthlyData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      const date = new Date(transaction.date);
      const monthYear = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      monthlyData[monthYear] = (monthlyData[monthYear] || 0) + transaction.amount;
    });

  return Object.entries(monthlyData)
    .map(([month, amount]) => ({
      month: new Date(month + '-01').toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
      amount
    }))
    .sort((a, b) => new Date(a.month).getTime() - new Date(b.month).getTime())
    .slice(-6); // Last 6 months
};

export const getCategoryExpenses = (transactions: Transaction[]) => {
  const categoryData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
    });

  return Object.entries(categoryData).map(([category, amount]) => ({
    category,
    amount,
    color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#95A5A6'
  }));
};

export const getCurrentMonthTransactions = (transactions: Transaction[]) => {
  const now = new Date();
  const currentMonth = now.getMonth();
  const currentYear = now.getFullYear();
  
  return transactions.filter(t => {
    const transactionDate = new Date(t.date);
    return transactionDate.getMonth() === currentMonth && transactionDate.getFullYear() === currentYear;
  });
};

export const getTotalIncome = (transactions: Transaction[]) => {
  return transactions.filter(t => t.type === 'income').reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalExpenses = (transactions: Transaction[]) => {
  return transactions.filter(t => t.type === 'expense').reduce((sum, t) => sum + t.amount, 0);
};
