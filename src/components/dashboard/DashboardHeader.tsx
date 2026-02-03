import { useNavigate } from "react-router-dom";
import { Search, User, LayoutDashboard } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ModeToggle } from "@/components/mode-toggle";
import { SidebarMenu } from "./SidebarMenu";

interface DashboardHeaderProps {
  title?: string;
}

const DashboardHeader = ({ title = "Dashboard Financeiro" }: DashboardHeaderProps) => {
  const navigate = useNavigate();
  const today = new Date().toLocaleDateString('pt-BR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });

  return (
    <header className="flex items-center justify-between py-6 px-8 bg-card rounded-2xl shadow-sm mb-6">
      <div className="flex items-center gap-4">
        <SidebarMenu />
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate("/")}
          title="Ir para o Dashboard"
        >
          <LayoutDashboard className="h-5 w-5 text-muted-foreground" />
        </Button>
        <div>
          <h1 className="text-2xl font-bold text-foreground">{title}</h1>
          <p className="text-muted-foreground capitalize">{today}</p>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Buscar transações..."
            className="pl-10 w-64 bg-secondary border-0"
          />
        </div>



        <ModeToggle />

        <Avatar className="h-10 w-10 border-2 border-primary">
          <AvatarImage src="https://i.pravatar.cc/40" alt="Usuário" />
          <AvatarFallback>
            <User className="h-5 w-5" />
          </AvatarFallback>
        </Avatar>
      </div>
    </header>
  );
};

export default DashboardHeader;
