import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/data/mockFinancialData";
import { useMemo } from "react";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";

interface IncomeExpenseChartProps {
  transactions: Transaction[];
}

const IncomeExpenseChart = ({ transactions }: IncomeExpenseChartProps) => {

  const monthlyData = useMemo(() => {
    // Group by month
    const grouped = new Map<string, { income: number; expenses: number, date: Date }>();

    transactions.forEach(t => {
      const date = new Date(t.date);
      const key = format(date, 'yyyy-MM'); // Key for sorting
      const monthLabel = format(date, 'MMM', { locale: ptBR }); // Label for display

      if (!grouped.has(key)) {
        grouped.set(key, { income: 0, expenses: 0, date });
      }

      const current = grouped.get(key)!;
      if (t.type === 'income') {
        current.income += t.amount;
      } else {
        current.expenses += t.amount;
      }
    });

    // Convert to array and sort by date, then take last 6 months
    return Array.from(grouped.entries())
      .sort((a, b) => a[1].date.getTime() - b[1].date.getTime())
      .slice(-6)
      .map(([key, val]) => ({
        month: format(val.date, 'MMM', { locale: ptBR }),
        income: val.income,
        expenses: val.expenses
      }));
  }, [transactions]);


  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-card p-3 rounded-lg shadow-lg border border-border">
          <p className="font-medium text-foreground mb-2">{label}</p>
          {payload.map((item: any, index: number) => (
            <p key={index} className="text-sm" style={{ color: item.color }}>
              {item.name}: {item.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-2">
        <CardTitle className="text-lg font-semibold">Receitas vs Despesas</CardTitle>
      </CardHeader>
      <CardContent>
        {monthlyData.length > 0 ? (
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={8}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--border))" vertical={false} />
              <XAxis
                dataKey="month"
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
              />
              <YAxis
                axisLine={false}
                tickLine={false}
                tick={{ fill: 'hsl(var(--muted-foreground))', fontSize: 12 }}
                tickFormatter={(value) => `${(value / 1000).toFixed(0)}k`}
              />
              <Tooltip content={<CustomTooltip />} />
              <Legend
                formatter={(value) => <span className="text-sm text-foreground">{value}</span>}
              />
              <Bar
                dataKey="income"
                name="Receitas"
                fill="hsl(var(--chart-income))"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
              <Bar
                dataKey="expenses"
                name="Despesas"
                fill="hsl(var(--chart-expense))"
                radius={[6, 6, 0, 0]}
                maxBarSize={40}
              />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <div className="h-[280px] flex items-center justify-center text-muted-foreground">
            Sem dados suficientes.
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default IncomeExpenseChart;
