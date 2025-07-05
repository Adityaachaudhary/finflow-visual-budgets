
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Budget, formatCurrency } from '@/lib/finance-utils';

interface BudgetChartProps {
  budgets: Budget[];
}

const BudgetChart: React.FC<BudgetChartProps> = ({ budgets }) => {
  if (budgets.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Budget vs Actual</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64 flex items-center justify-center text-muted-foreground">
            No budget data available
          </div>
        </CardContent>
      </Card>
    );
  }

  const chartData = budgets.map(budget => ({
    category: budget.category.length > 12 ? budget.category.substring(0, 12) + '...' : budget.category,
    fullCategory: budget.category,
    budgeted: budget.amount,
    spent: budget.spent,
    remaining: Math.max(0, budget.amount - budget.spent)
  }));

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length > 0) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium mb-2">{data.fullCategory}</p>
          <div className="space-y-1 text-sm">
            <p>Budgeted: {formatCurrency(data.budgeted)}</p>
            <p>Spent: {formatCurrency(data.spent)}</p>
            <p className={data.spent > data.budgeted ? 'text-red-600' : 'text-green-600'}>
              {data.spent > data.budgeted 
                ? `Over by: ${formatCurrency(data.spent - data.budgeted)}`
                : `Remaining: ${formatCurrency(data.remaining)}`
              }
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Budget vs Actual Spending</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="h-80">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 20, bottom: 60 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis 
                dataKey="category" 
                fontSize={12}
                tick={{ fill: '#666' }}
                angle={-45}
                textAnchor="end"
                height={60}
              />
              <YAxis 
                fontSize={12}
                tick={{ fill: '#666' }}
                tickFormatter={(value) => `$${value}`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend />
              <Bar 
                dataKey="budgeted" 
                fill="hsl(var(--primary))"
                name="Budgeted"
                radius={[2, 2, 0, 0]}
              />
              <Bar 
                dataKey="spent" 
                fill="hsl(var(--destructive))"
                name="Spent"
                radius={[2, 2, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default BudgetChart;
