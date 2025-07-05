
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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

  const addBudget = () => {
    if (!newBudget.category || !newBudget.amount || parseFloat(newBudget.amount) <= 0) {
      toast({
        title: "Invalid Budget",
        description: "Please select a category and enter a valid amount",
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
    } else {
      const budget: Budget = {
        category: newBudget.category,
        amount: parseFloat(newBudget.amount),
        spent: budgets.find(b => b.category === newBudget.category)?.spent || 0
      };
      onUpdateBudgets([...budgets, budget]);
    }

    setNewBudget({ category: '', amount: '' });
    toast({
      title: "Budget Updated",
      description: `Budget for ${newBudget.category} has been set to ${formatCurrency(parseFloat(newBudget.amount))}`,
    });
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
    if (percentage > 100) return { status: 'over', color: 'text-red-600' };
    if (percentage > 80) return { status: 'warning', color: 'text-yellow-600' };
    return { status: 'good', color: 'text-green-600' };
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Set Budget</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-2">
            <div className="flex-1">
              <Select value={newBudget.category} onValueChange={(value) => 
                setNewBudget(prev => ({ ...prev, category: value }))
              }>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {availableCategories.map(category => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Input
                type="number"
                step="0.01"
                placeholder="Budget amount"
                value={newBudget.amount}
                onChange={(e) => setNewBudget(prev => ({ ...prev, amount: e.target.value }))}
              />
            </div>
            <Button onClick={addBudget} disabled={availableCategories.length === 0}>
              <Plus className="h-4 w-4" />
            </Button>
          </div>
          {availableCategories.length === 0 && (
            <p className="text-sm text-muted-foreground mt-2">
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
            <div className="space-y-4">
              {budgets.map((budget) => {
                const status = getBudgetStatus(budget);
                const percentage = Math.min((budget.spent / budget.amount) * 100, 100);
                
                return (
                  <div key={budget.category} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{budget.category}</span>
                        <Badge 
                          variant="outline"
                          className={status.color}
                        >
                          {status.status === 'over' ? 'Over Budget' : 
                           status.status === 'warning' ? 'Near Limit' : 'On Track'}
                        </Badge>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm">
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
                      className="h-2"
                    />
                    <div className="flex justify-between text-xs text-muted-foreground">
                      <span>{percentage.toFixed(1)}% used</span>
                      <span>
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
