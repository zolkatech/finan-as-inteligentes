import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction, categories } from "@/data/mockFinancialData";
import { useMemo } from "react";

interface ExpensesPieChartProps {
  transactions: Transaction[];
}

const ExpensesPieChart = ({ transactions }: ExpensesPieChartProps) => {

  // Calculate category expenses from transactions
  const categoryExpenses = useMemo(() => {
    const expenses = transactions.filter(t => t.type === 'expense');
    const categoryMap = new Map<string, number>();

    expenses.forEach(t => {
      // Normalize category naming just in case (though DB should be clean now)
      const catName = t.category;
      const current = categoryMap.get(catName) || 0;
      categoryMap.set(catName, current + t.amount);
    });

    return Array.from(categoryMap.entries()).map(([name, value]) => {
      // Find the official category config to get the correct color
      const categoryConfig = categories.find(c => c.name === name || c.id === name.toLowerCase());

      // Default color if not found (fallback)
      const color = categoryConfig ? categoryConfig.color : 'hsl(0, 0%, 50%)';

      return {
        name,
        value,
        color
      };
    }).sort((a, b) => b.value - a.value);
  }, [transactions]);


  const total = categoryExpenses.reduce((sum, item) => sum + item.value, 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      const percentage = total > 0 ? ((data.value / total) * 100).toFixed(1) : "0.0";
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-foreground">{data.name}</p>
          <p className="text-sm text-muted-foreground">
            {data.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          </p>
          <p className="text-sm text-primary font-medium">{percentage}%</p>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Gastos por Categoria</CardTitle>
      </CardHeader>
      <CardContent>
        {categoryExpenses.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie
                data={categoryExpenses}
                cx="50%"
                cy="50%"
                innerRadius={60}
                outerRadius={100}
                paddingAngle={3}
                dataKey="value"
              >
                {categoryExpenses.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} strokeWidth={0} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
              <Legend
                layout="horizontal"
                verticalAlign="bottom"
                align="center"
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Sem dados de despesas.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default ExpensesPieChart;
