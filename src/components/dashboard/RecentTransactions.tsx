import { UtensilsCrossed, Car, Gamepad2, Heart, GraduationCap, Home, ShoppingBag, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { transactions } from "@/data/mockFinancialData";

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  UtensilsCrossed,
  Car,
  Gamepad2,
  Heart,
  GraduationCap,
  Home,
  ShoppingBag,
  Wallet,
};

const RecentTransactions = () => {
  const recentTransactions = transactions.slice(0, 6);

  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Últimas Transações</CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {recentTransactions.map((transaction) => {
          const IconComponent = iconMap[transaction.icon] || Wallet;
          const isIncome = transaction.type === 'income';
          
          return (
            <div
              key={transaction.id}
              className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
            >
              <div className={`p-2.5 rounded-xl ${isIncome ? 'bg-success/10' : 'bg-primary/10'}`}>
                <IconComponent className={`h-5 w-5 ${isIncome ? 'text-success' : 'text-primary'}`} />
              </div>
              
              <div className="flex-1 min-w-0">
                <p className="font-medium text-foreground truncate">{transaction.description}</p>
                <p className="text-sm text-muted-foreground">
                  {new Date(transaction.date).toLocaleDateString('pt-BR', { 
                    day: '2-digit', 
                    month: 'short' 
                  })}
                </p>
              </div>
              
              <p className={`font-semibold ${isIncome ? 'text-success' : 'text-primary'}`}>
                {isIncome ? '+' : '-'} {transaction.amount.toLocaleString('pt-BR', { 
                  style: 'currency', 
                  currency: 'BRL' 
                })}
              </p>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default RecentTransactions;
