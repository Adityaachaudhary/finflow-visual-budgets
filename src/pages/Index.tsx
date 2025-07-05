
import React, { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { PlusCircle, BarChart3, PieChart, Settings } from 'lucide-react';

import TransactionForm from '@/components/TransactionForm';
import TransactionList from '@/components/TransactionList';
import ExpenseChart from '@/components/ExpenseChart';
import CategoryChart from '@/components/CategoryChart';
import BudgetManager from '@/components/BudgetManager';
import BudgetChart from '@/components/BudgetChart';
import SummaryCards from '@/components/SummaryCards';

import {
  Transaction,
  Budget,
  loadTransactions,
  saveTransactions,
  loadBudgets,
  saveBudgets,
  getMonthlyExpenses,
  getCategoryExpenses,
  getCurrentMonthTransactions
} from '@/lib/finance-utils';

import { toast } from '@/hooks/use-toast';

const Index = () => {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [editingTransaction, setEditingTransaction] = useState<Transaction | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);

  // Load data on component mount
  useEffect(() => {
    const loadedTransactions = loadTransactions();
    const loadedBudgets = loadBudgets();
    
    setTransactions(loadedTransactions);
    setBudgets(loadedBudgets);
    
    // Update budget spent amounts based on current transactions
    updateBudgetSpending(loadedBudgets, loadedTransactions);
  }, []);

  const updateBudgetSpending = (currentBudgets: Budget[], currentTransactions: Transaction[]) => {
    const currentMonthTransactions = getCurrentMonthTransactions(currentTransactions);
    const categoryExpenses = getCategoryExpenses(currentMonthTransactions);
    
    const updatedBudgets = currentBudgets.map(budget => {
      const categoryExpense = categoryExpenses.find(exp => exp.category === budget.category);
      return {
        ...budget,
        spent: categoryExpense?.amount || 0
      };
    });

    if (JSON.stringify(updatedBudgets) !== JSON.stringify(currentBudgets)) {
      setBudgets(updatedBudgets);
      saveBudgets(updatedBudgets);
    }
  };

  const handleAddTransaction = (transaction: Transaction) => {
    let updatedTransactions;
    
    if (editingTransaction) {
      updatedTransactions = transactions.map(t => 
        t.id === editingTransaction.id ? transaction : t
      );
      setEditingTransaction(null);
    } else {
      updatedTransactions = [...transactions, transaction];
    }
    
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    updateBudgetSpending(budgets, updatedTransactions);
    setShowAddForm(false);
  };

  const handleEditTransaction = (transaction: Transaction) => {
    setEditingTransaction(transaction);
    setShowAddForm(true);
  };

  const handleDeleteTransaction = (id: string) => {
    const updatedTransactions = transactions.filter(t => t.id !== id);
    setTransactions(updatedTransactions);
    saveTransactions(updatedTransactions);
    updateBudgetSpending(budgets, updatedTransactions);
    
    toast({
      title: "Transaction Deleted",
      description: "The transaction has been removed successfully.",
    });
  };

  const handleCancelEdit = () => {
    setEditingTransaction(null);
    setShowAddForm(false);
  };

  const handleUpdateBudgets = (newBudgets: Budget[]) => {
    setBudgets(newBudgets);
    saveBudgets(newBudgets);
    updateBudgetSpending(newBudgets, transactions);
  };

  // Prepare chart data
  const monthlyExpenses = getMonthlyExpenses(transactions);
  const categoryExpenses = getCategoryExpenses(transactions);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-green-50 p-4">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            FinFlow
          </h1>
          <p className="text-muted-foreground">
            Your Personal Finance Visualizer
          </p>
        </div>

        {/* Summary Cards */}
        <SummaryCards transactions={transactions} budgets={budgets} />

        {/* Main Content */}
        <Tabs defaultValue="dashboard" className="w-full">
          <TabsList className="grid w-full grid-cols-4 lg:grid-cols-5">
            <TabsTrigger value="dashboard" className="flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              <span className="hidden sm:inline">Dashboard</span>
            </TabsTrigger>
            <TabsTrigger value="transactions" className="flex items-center gap-2">
              <PlusCircle className="h-4 w-4" />
              <span className="hidden sm:inline">Transactions</span>
            </TabsTrigger>
            <TabsTrigger value="analytics" className="flex items-center gap-2">
              <PieChart className="h-4 w-4" />
              <span className="hidden sm:inline">Analytics</span>
            </TabsTrigger>
            <TabsTrigger value="budgets" className="flex items-center gap-2">
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Budgets</span>
            </TabsTrigger>
            <TabsTrigger value="insights" className="hidden lg:flex items-center gap-2">
              <BarChart3 className="h-4 w-4" />
              Insights
            </TabsTrigger>
          </TabsList>

          <TabsContent value="dashboard" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart data={monthlyExpenses} />
              <CategoryChart data={categoryExpenses} />
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <TransactionList 
                  transactions={transactions.slice(0, 10)} 
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </div>
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <Button 
                    className="w-full" 
                    onClick={() => setShowAddForm(true)}
                  >
                    <PlusCircle className="h-4 w-4 mr-2" />
                    Add Transaction
                  </Button>
                  <div className="grid grid-cols-2 gap-2">
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-primary">
                        {transactions.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Total Transactions
                      </div>
                    </div>
                    <div className="text-center p-3 bg-muted rounded-lg">
                      <div className="text-2xl font-bold text-accent">
                        {budgets.length}
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Active Budgets
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="transactions" className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-bold">Transactions</h2>
              {!showAddForm && (
                <Button onClick={() => setShowAddForm(true)}>
                  <PlusCircle className="h-4 w-4 mr-2" />
                  Add Transaction
                </Button>
              )}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {showAddForm && (
                <div className="lg:col-span-1">
                  <TransactionForm
                    onSubmit={handleAddTransaction}
                    editingTransaction={editingTransaction}
                    onCancel={handleCancelEdit}
                  />
                </div>
              )}
              <div className={showAddForm ? "lg:col-span-2" : "lg:col-span-3"}>
                <TransactionList 
                  transactions={transactions}
                  onEdit={handleEditTransaction}
                  onDelete={handleDeleteTransaction}
                />
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            <h2 className="text-2xl font-bold">Analytics</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <ExpenseChart data={monthlyExpenses} />
              <CategoryChart data={categoryExpenses} />
            </div>
            {budgets.length > 0 && (
              <BudgetChart budgets={budgets} />
            )}
          </TabsContent>

          <TabsContent value="budgets" className="space-y-6">
            <h2 className="text-2xl font-bold">Budget Management</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <BudgetManager 
                budgets={budgets}
                onUpdateBudgets={handleUpdateBudgets}
              />
              {budgets.length > 0 && (
                <BudgetChart budgets={budgets} />
              )}
            </div>
          </TabsContent>

          <TabsContent value="insights" className="space-y-6 hidden lg:block">
            <h2 className="text-2xl font-bold">Financial Insights</h2>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle>Spending Trends</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {categoryExpenses.slice(0, 5).map((category, index) => (
                      <div key={category.category} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category.color }}
                          />
                          <span className="text-sm">{category.category}</span>
                        </div>
                        <span className="text-sm font-medium">
                          ${category.amount.toFixed(0)}
                        </span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Budget Performance</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {budgets.map((budget) => {
                      const percentage = (budget.spent / budget.amount) * 100;
                      const status = percentage > 100 ? 'Over' : 
                                   percentage > 80 ? 'High' : 'Good';
                      return (
                        <div key={budget.category} className="space-y-1">
                          <div className="flex justify-between text-sm">
                            <span>{budget.category}</span>
                            <span className={
                              status === 'Over' ? 'text-red-600' :
                              status === 'High' ? 'text-yellow-600' : 'text-green-600'
                            }>
                              {status}
                            </span>
                          </div>
                          <div className="text-xs text-muted-foreground">
                            {percentage.toFixed(1)}% used
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {transactions.slice(0, 5).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between text-sm">
                        <div>
                          <div className="font-medium">{transaction.description}</div>
                          <div className="text-muted-foreground">{transaction.category}</div>
                        </div>
                        <div className={
                          transaction.type === 'income' ? 'text-green-600' : 'text-red-600'
                        }>
                          {transaction.type === 'income' ? '+' : '-'}${transaction.amount}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
