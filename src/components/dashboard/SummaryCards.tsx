import { TrendingUp, TrendingDown, Wallet, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { summaryData } from "@/data/mockFinancialData";

interface SummaryCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
}

const SummaryCard = ({ title, value, change, icon, iconBg }: SummaryCardProps) => {
  const isPositive = change >= 0;
  
  return (
    <Card className="shadow-sm border-0 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {isPositive ? (
                <ArrowUpRight className="h-4 w-4" />
              ) : (
                <ArrowDownRight className="h-4 w-4" />
              )}
              <span>{Math.abs(change)}% vs mês anterior</span>
            </div>
          </div>
          <div className={`p-3 rounded-xl ${iconBg}`}>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

const SummaryCards = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total de Receitas"
        value={summaryData.totalIncome}
        change={summaryData.incomeChange}
        icon={<TrendingUp className="h-6 w-6 text-success" />}
        iconBg="bg-success/10"
      />
      <SummaryCard
        title="Total de Despesas"
        value={summaryData.totalExpenses}
        change={summaryData.expenseChange}
        icon={<TrendingDown className="h-6 w-6 text-primary" />}
        iconBg="bg-primary/10"
      />
      <SummaryCard
        title="Saldo Atual"
        value={summaryData.balance}
        change={summaryData.balanceChange}
        icon={<Wallet className="h-6 w-6 text-chart-2" />}
        iconBg="bg-[hsl(199,89%,48%)]/10"
      />
      <SummaryCard
        title="Economia do Mês"
        value={summaryData.balance - summaryData.lastMonthBalance}
        change={((summaryData.balance - summaryData.lastMonthBalance) / summaryData.lastMonthBalance * 100)}
        icon={<TrendingUp className="h-6 w-6 text-chart-3" />}
        iconBg="bg-[hsl(262,83%,58%)]/10"
      />
    </div>
  );
};

export default SummaryCards;
