import { UtensilsCrossed, Car, Gamepad2, Heart, GraduationCap, Home, ShoppingBag, Wallet } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Transaction } from "@/data/mockFinancialData";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { useState } from "react";

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

interface RecentTransactionsProps {
  transactions: Transaction[];
}

const RecentTransactions = ({ transactions }: RecentTransactionsProps) => {
  const [filterType, setFilterType] = useState<'all' | 'income' | 'expense'>('all');
  const [selectedTransaction, setSelectedTransaction] = useState<Transaction | null>(null);

  const filteredTransactions = transactions.filter(t => {
    if (filterType === 'all') return true;
    return t.type === filterType;
  });

  const recentTransactions = filteredTransactions.slice(0, 6);

  return (
    <>
      <Card className="shadow-sm border-0">
        <CardHeader className="pb-3 flex flex-row items-center justify-between space-y-0">
          <CardTitle className="text-lg font-semibold">Últimas Transações</CardTitle>
          <div className="flex bg-secondary/50 rounded-lg p-1 gap-1">
            <button
              onClick={() => setFilterType('all')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterType === 'all' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Todos
            </button>
            <button
              onClick={() => setFilterType('income')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterType === 'income' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Receitas
            </button>
            <button
              onClick={() => setFilterType('expense')}
              className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${filterType === 'expense' ? 'bg-background text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}
            >
              Despesas
            </button>
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {recentTransactions.map((transaction) => {
            const IconComponent = iconMap[transaction.icon] || Wallet;
            const isIncome = transaction.type === 'income';

            return (
              <div
                key={transaction.id}
                className="flex items-center gap-4 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors cursor-pointer"
                onClick={() => setSelectedTransaction(transaction)}
              >
                <div>
                  <IconComponent className="h-5 w-5 text-foreground" />
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

                <p className={`font-semibold ${isIncome ? 'text-success' : 'text-destructive'}`}>
                  {isIncome ? '+' : '-'} {transaction.amount.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </p>
              </div>
            );
          })}
          {recentTransactions.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              Nenhuma transação recente.
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={!!selectedTransaction} onOpenChange={(open) => !open && setSelectedTransaction(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Detalhes da Transação</DialogTitle>
          </DialogHeader>

          {selectedTransaction && (
            <div className="space-y-4">
              <div className="flex flex-col items-center justify-center p-6 bg-secondary/20 rounded-xl">
                <div className="p-3 bg-background rounded-full shadow-sm mb-3">
                  {(() => {
                    const Icon = iconMap[selectedTransaction.icon] || Wallet;
                    return <Icon className="h-8 w-8 text-primary" />;
                  })()}
                </div>
                <h3 className="text-xl font-bold text-center">{selectedTransaction.description}</h3>
                <p className={`text-2xl font-bold mt-2 ${selectedTransaction.type === 'income' ? 'text-success' : 'text-destructive'}`}>
                  {selectedTransaction.type === 'income' ? '+' : '-'} {selectedTransaction.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>

              <div className="grid gap-3">
                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-muted-foreground">Data e Hora</span>
                  <span className="font-medium">
                    {new Date(selectedTransaction.date).toLocaleString('pt-BR', {
                      dateStyle: 'full',
                      timeStyle: 'short'
                    })}
                  </span>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-muted-foreground">Categoria</span>
                  <span className="font-medium capitalize">{selectedTransaction.category}</span>
                </div>

                <div className="flex justify-between items-center p-3 border rounded-lg">
                  <span className="text-muted-foreground">Tipo</span>
                  <span className="font-medium capitalize">
                    {selectedTransaction.type === 'income' ? 'Receita' : 'Despesa'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </>
  );
};

export default RecentTransactions;
