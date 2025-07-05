
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Budget, CATEGORIES, formatCurrency } from '@/lib/finance-utils';
import { toast } from '@/hooks/use-toast';
import { Plus, Trash2 } from 'lucide-react';

interface BudgetManagerProps {
  budgets: Budget[];
  onUpdateBudgets: (budgets: Budget[]) => void;
}

const BudgetManager: React.FC<BudgetManagerProps> = ({ budgets, onUpdateBudgets }) => {
  const [newBudget, setNewBudget] = useState({ category: '', amount: '' });
  const [errors, setErrors] = useState<{ [key: string]: string }>({});

  const validateBudget = () => {
    const newErrors: { [key: string]: string } = {};

    if (!newBudget.category) {
      newErrors.category = 'Please select a category';
    }

    if (!newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const addBudget = () => {
    if (!validateBudget()) {
      toast({
        title: "Invalid Budget",
        description: "Please fix the errors in the form",
        variant: "destructive"
      });
      return;
    }

    const existingBudgetIndex = budgets.findIndex(b => b.category === newBudget.category);
    
    if (existingBudgetIndex >= 0) {
      const updatedBudgets = [...budgets];
      updatedBudgets[existingBudgetIndex] = {
        ...updatedBudgets[existingBudgetIndex],
        amount: parseFloat(newBudget.amount)
      };
      onUpdateBudgets(updatedBudgets);
      toast({
        title: "Budget Updated",
        description: `Budget for ${newBudget.category} updated to ${formatCurrency(parseFloat(newBudget.amount))}`,
      });
    } else {
      const budget: Budget = {
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        spent: 0
      };
      onUpdateBudgets([...budgets, budget]);
      toast({
        title: "Budget Added",
        description: `Budget for ${newBudget.category} set to ${formatCurrency(parseFloat(newBudget.amount))}`,
      });
    }

    setNewBudget({ category: '', amount: '' });
    setErrors({});
  };

  const deleteBudget = (category: string) => {
    onUpdateBudgets(budgets.filter(b => b.category !== category));
    toast({
      title: "Budget Deleted",
      description: `Budget for ${category} has been removed`,
    });
  };

  const availableCategories = CATEGORIES.filter(
    category => !budgets.some(b => b.category === category)
  );

  const getBudgetStatus = (budget: Budget) => {
    const percentage = (budget.spent / budget.amount) * 100;
    if (percentage > 100) return { status: 'Over Budget', color: 'bg-red-100 text-red-800', textColor: 'text-red-600' };
    if (percentage > 80) return { status: 'Near Limit', color: 'bg-yellow-100 text-yellow-800', textColor: 'text-yellow-600' };
    return { status: 'On Track', color: 'bg-green-100 text-green-800', textColor: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Monthly Budget</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Select 
                value={newBudget.category} 
                onValueChange={(value) => {
                  setNewBudget(prev => ({ ...prev, category: value }));
                  if (errors.category) setErrors(prev => ({ ...prev, category: '' }));
                }}
              >
                <SelectTrigger className={errors.category ? 'border-red-500' : ''}>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent className="bg-white border shadow-lg z-50">
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && <p className="text-red-500 text-sm">{errors.category}</p>}
            </div>
            
            <div className="space-y-2">
              <Input
                type="number"
                step="0.01"
                placeholder="Budget amount"
                value={newBudget.amount}
                onChange={(e) => {
                  setNewBudget(prev => ({ ...prev, amount: e.target.value }));
                  if (errors.amount) setErrors(prev => ({ ...prev, amount: '' }));
                }}
                className={errors.amount ? 'border-red-500' : ''}
              />
              {errors.amount && <p className="text-red-500 text-sm">{errors.amount}</p>}
            </div>
            
            <Button onClick={addBudget} disabled={availableCategories.length === 0} className="h-10">
              <Plus className="h-4 w-4 mr-2" />
              Add Budget
            </Button>
          </div>
          
          {availableCategories.length === 0 && (
            <p className="text-sm text-muted-foreground">
              All categories have budgets set. Delete a budget to add a new one.
            </p>
          )}
        </CardContent>
      </Card>

      {budgets.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Budget Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget);
                const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
                
                return (
                  <div key={budget.category} className="space-y-3 p-4 border rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <span className="font-medium text-lg">{budget.category}</span>
                        <Badge className={status.color}>
                          {status.status}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="text-sm font-medium">
                          {formatCurrency(budget.spent)} / {formatCurrency(budget.amount)}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => deleteBudget(budget.category)}
                          className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                    
                    <Progress 
                      value={percentage} 
                      className="h-3"
                    />
                    
                    <div className="flex justify-between text-sm text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span className={status.textColor}>
                        {budget.amount - budget.spent > 0 
                          ? `${formatCurrency(budget.amount - budget.spent)} remaining`
                          : `${formatCurrency(budget.spent - budget.amount)} over budget`
                        }
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default BudgetManager;
