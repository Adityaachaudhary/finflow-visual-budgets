
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Transaction, 
  Budget, 
  formatCurrency, 
  getCurrentMonthTransactions,
  getTotalIncome,
  getTotalExpenses 
} from '@/lib/finance-utils';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';

interface SummaryCardsProps {
  transactions: Transaction[];
  budgets: Budget[];
}

const SummaryCards: React.FC<SummaryCardsProps> = ({ transactions, budgets }) => {
  const currentMonthTransactions = getCurrentMonthTransactions(transactions);
  const totalIncome = getTotalIncome(currentMonthTransactions);
  const totalExpenses = getTotalExpenses(currentMonthTransactions);
  const netIncome = totalIncome - totalExpenses;

  const totalBudget = budgets.reduce((sum, budget) => sum + budget.amount, 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const budgetRemaining = totalBudget - totalSpent;

  const overBudgetCategories = budgets.filter(b => b.spent > b.amount).length;

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Income</CardTitle>
          <TrendingUp className="h-4 w-4 text-green-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-green-600">
            {formatCurrency(totalIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Monthly Expenses</CardTitle>
          <TrendingDown className="h-4 w-4 text-red-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-red-600">
            {formatCurrency(totalExpenses)}
          </div>
          <p className="text-xs text-muted-foreground">
            This month
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Net Income</CardTitle>
          <DollarSign className={`h-4 w-4 ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`} />
        </CardHeader>
        <CardContent>
          <div className={`text-2xl font-bold ${netIncome >= 0 ? 'text-green-600' : 'text-red-600'}`}>
            {formatCurrency(netIncome)}
          </div>
          <p className="text-xs text-muted-foreground">
            Income - Expenses
          </p>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-sm font-medium">Budget Status</CardTitle>
          <PiggyBank className="h-4 w-4 text-blue-600" />
        </CardHeader>
        <CardContent>
          <div className="text-2xl font-bold text-blue-600">
            {formatCurrency(budgetRemaining)}
          </div>
          <div className="flex items-center gap-2 mt-1">
            <p className="text-xs text-muted-foreground">Remaining</p>
            {overBudgetCategories > 0 && (
              <Badge variant="destructive" className="text-xs">
                {overBudgetCategories} over
              </Badge>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SummaryCards;
