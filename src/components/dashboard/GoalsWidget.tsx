import { Shield, Plane, Laptop } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { goals } from "@/data/mockFinancialData";

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
  Shield,
  Plane,
  Laptop,
};

const GoalsWidget = () => {
  return (
    <Card className="shadow-sm border-0">
      <CardHeader className="pb-3">
        <CardTitle className="text-lg font-semibold">Metas Financeiras</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {goals.map((goal) => {
          const IconComponent = iconMap[goal.icon] || Shield;
          const percentage = Math.round((goal.current / goal.target) * 100);
          
          return (
            <div key={goal.id} className="p-4 bg-secondary/50 rounded-xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2 rounded-lg bg-primary/10">
                  <IconComponent className="h-5 w-5 text-primary" />
                </div>
                <div className="flex-1">
                  <p className="font-medium text-foreground">{goal.name}</p>
                  <p className="text-xs text-muted-foreground">{goal.daysLeft} dias restantes</p>
                </div>
                <span className="text-sm font-semibold text-primary">{percentage}%</span>
              </div>
              
              <Progress value={percentage} className="h-2 mb-2" />
              
              <div className="flex justify-between text-sm">
                <span className="text-muted-foreground">
                  {goal.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
                <span className="text-foreground font-medium">
                  {goal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
};

export default GoalsWidget;
