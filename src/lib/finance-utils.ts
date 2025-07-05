
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
  'Groceries',
  'Rent/Mortgage',
  'Insurance',
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
  'Groceries': '#FF8A65',
  'Rent/Mortgage': '#81C784',
  'Insurance': '#64B5F6',
  'Other': '#85C1E9'
};

export const loadTransactions = (): Transaction[] => {
  try {
    const stored = localStorage.getItem('finflow_transactions');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading transactions:', error);
    return [];
  }
};

export const saveTransactions = (transactions: Transaction[]) => {
  try {
    localStorage.setItem('finflow_transactions', JSON.stringify(transactions));
  } catch (error) {
    console.error('Error saving transactions:', error);
  }
};

export const loadBudgets = (): Budget[] => {
  try {
    const stored = localStorage.getItem('finflow_budgets');
    return stored ? JSON.parse(stored) : [];
  } catch (error) {
    console.error('Error loading budgets:', error);
    return [];
  }
};

export const saveBudgets = (budgets: Budget[]) => {
  try {
    localStorage.setItem('finflow_budgets', JSON.stringify(budgets));
  } catch (error) {
    console.error('Error saving budgets:', error);
  }
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
    .sort((a, b) => {
      const dateA = new Date(a.month + ' 01');
      const dateB = new Date(b.month + ' 01');
      return dateA.getTime() - dateB.getTime();
    })
    .slice(-6); // Last 6 months
};

export const getCategoryExpenses = (transactions: Transaction[]) => {
  const categoryData: { [key: string]: number } = {};
  
  transactions
    .filter(t => t.type === 'expense')
    .forEach(transaction => {
      categoryData[transaction.category] = (categoryData[transaction.category] || 0) + transaction.amount;
    });

  return Object.entries(categoryData)
    .map(([category, amount]) => ({
      category,
      amount,
      color: CATEGORY_COLORS[category as keyof typeof CATEGORY_COLORS] || '#95A5A6'
    }))
    .sort((a, b) => b.amount - a.amount); // Sort by amount descending
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
  return transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + t.amount, 0);
};

export const getTotalExpenses = (transactions: Transaction[]) => {
  return transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + t.amount, 0);
};
