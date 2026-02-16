import { TrendingUp, TrendingDown, Calendar, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { SummaryData } from "@/hooks/useFinancials";

interface SummaryCardProps {
  title: string;
  value: number;
  change: number;
  icon: React.ReactNode;
  iconBg: string;
  isCurrency?: boolean;
}

const SummaryCard = ({ title, value, change, icon, iconBg, isCurrency = true }: SummaryCardProps) => {
  const isPositive = change >= 0;

  return (
    <Card className="shadow-sm border-0 hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex items-start justify-between">
          <div>
            <p className="text-sm text-muted-foreground mb-1">{title}</p>
            <p className="text-2xl font-bold text-foreground">
              {isCurrency ? value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' }) : value}
            </p>
            <div className={`flex items-center gap-1 mt-2 text-sm ${isPositive ? 'text-success' : 'text-destructive'}`}>
              {!isCurrency ? (
                <span className="text-muted-foreground">Agendados</span>
              ) : (
                <>
                  {isPositive ? (
                    <ArrowUpRight className="h-4 w-4" />
                  ) : (
                    <ArrowDownRight className="h-4 w-4" />
                  )}
                  <span>{Math.abs(change).toFixed(1)}% vs mês anterior</span>
                </>
              )}
            </div>
          </div>
          <div>
            {icon}
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

interface SummaryCardsProps {
  summary: SummaryData;
  eventsCount: number;
}

const SummaryCards = ({ summary, eventsCount }: SummaryCardsProps) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
      <SummaryCard
        title="Total de Receitas"
        value={summary.totalIncome}
        change={summary.incomeChange}
        icon={<TrendingUp className="h-6 w-6 text-foreground" />}
        iconBg=""
      />
      <SummaryCard
        title="Total de Despesas"
        value={summary.totalExpenses}
        change={summary.expenseChange}
        icon={<TrendingDown className="h-6 w-6 text-foreground" />}
        iconBg=""
      />
      <SummaryCard
        title="Eventos de Hoje"
        value={eventsCount}
        change={0}
        icon={<Calendar className="h-6 w-6 text-foreground" />}
        iconBg=""
        isCurrency={false}
      />
      <SummaryCard
        title="Economia do Mês"
        value={summary.balance - summary.lastMonthBalance}
        change={summary.lastMonthBalance !== 0 ? ((summary.balance - summary.lastMonthBalance) / summary.lastMonthBalance * 100) : 0}
        icon={<TrendingUp className="h-6 w-6 text-foreground" />}
        iconBg=""
      />
    </div>
  );
};

export default SummaryCards;
