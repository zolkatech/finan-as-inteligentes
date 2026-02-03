import { useState, useEffect } from "react";
import { Plus, Shield, Plane, Laptop, Home, Car, Gamepad2, GraduationCap, ShoppingBag, Calendar as CalendarIcon, TrendingUp, Smartphone, Coffee, Music, Sun, Moon, Star, Cloud, Umbrella, Zap, Award, Gift, Trash2 } from "lucide-react";
import { format, differenceInDays } from "date-fns";
import { ptBR } from "date-fns/locale";
import DashboardHeader from "../components/dashboard/DashboardHeader";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { goals as initialGoals } from "@/data/mockFinancialData";

const iconMap: { [key: string]: React.ComponentType<{ className?: string }> } = {
    Shield, Plane, Laptop, Home, Car, Gamepad2, GraduationCap, ShoppingBag,
    TrendingUp, Smartphone, Coffee, Music, Sun, Moon, Star, Cloud, Umbrella, Zap, Award, Gift
};

const Goals = () => {
    const [goals, setGoals] = useState(initialGoals);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [currentGoal, setCurrentGoal] = useState<any>(null);

    // Form states
    const [name, setName] = useState("");
    const [target, setTarget] = useState("");
    const [current, setCurrent] = useState("");
    const [targetDate, setTargetDate] = useState<Date | undefined>(undefined);
    const [icon, setIcon] = useState("Shield");

    const resetForm = () => {
        setName("");
        setTarget("");
        setCurrent("");
        setTargetDate(undefined);
        setIcon("Shield");
        setCurrentGoal(null);
    };

    const handleOpenChange = (open: boolean) => {
        setIsDialogOpen(open);
        if (!open) resetForm();
    };

    const handleEdit = (goal: any) => {
        setCurrentGoal(goal);
        setName(goal.name);
        setTarget(goal.target.toString());
        setCurrent(goal.current.toString());

        // Approximate date based on daysLeft for editing, since we don't store the actual date
        const estimatedDate = new Date();
        estimatedDate.setDate(estimatedDate.getDate() + goal.daysLeft);
        setTargetDate(estimatedDate);

        setIcon(goal.icon);
        setIsDialogOpen(true);
    };

    const handleSave = () => {
        const daysRemaining = targetDate ? differenceInDays(targetDate, new Date()) : 0;

        const newGoal = {
            id: currentGoal ? currentGoal.id : Date.now().toString(),
            name,
            target: Number(target),
            current: Number(current),
            daysLeft: Math.max(0, daysRemaining),
            icon,
        };

        if (currentGoal) {
            setGoals(goals.map(g => g.id === currentGoal.id ? newGoal : g));
        } else {
            setGoals([...goals, newGoal]);
        }

        setIsDialogOpen(false);
        resetForm();
    };

    const handleDelete = () => {
        if (currentGoal) {
            setGoals(goals.filter(g => g.id !== currentGoal.id));
            setIsDialogOpen(false);
            resetForm();
        }
    };

    return (
        <div className="min-h-screen bg-secondary/30 pb-20">
            <div className="container mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <DashboardHeader title="Minhas Metas" />

                <div className="flex justify-end mb-6">
                    <Dialog open={isDialogOpen} onOpenChange={handleOpenChange}>
                        <DialogTrigger asChild>
                            <Button className="bg-primary hover:bg-primary/90">
                                <Plus className="mr-2 h-4 w-4" /> Nova Meta
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>{currentGoal ? "Editar Meta" : "Criar Nova Meta"}</DialogTitle>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="name" className="text-right">Nome</Label>
                                    <Input id="name" value={name} onChange={(e) => setName(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="target" className="text-right">Alvo (R$)</Label>
                                    <Input id="target" type="number" value={target} onChange={(e) => setTarget(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="current" className="text-right">Atual (R$)</Label>
                                    <Input id="current" type="number" value={current} onChange={(e) => setCurrent(e.target.value)} className="col-span-3" />
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label className="text-right">Data Alvo</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button
                                                variant={"outline"}
                                                className={cn(
                                                    "col-span-3 justify-start text-left font-normal",
                                                    !targetDate && "text-muted-foreground"
                                                )}
                                            >
                                                <CalendarIcon className="mr-2 h-4 w-4" />
                                                {targetDate ? format(targetDate, "PPP", { locale: ptBR }) : <span>Selecione uma data</span>}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-auto p-0">
                                            <Calendar
                                                mode="single"
                                                selected={targetDate}
                                                onSelect={setTargetDate}
                                                initialFocus
                                            />
                                        </PopoverContent>
                                    </Popover>
                                </div>
                                <div className="grid grid-cols-4 items-center gap-4">
                                    <Label htmlFor="icon" className="text-right">Ícone</Label>
                                    <Popover>
                                        <PopoverTrigger asChild>
                                            <Button variant="outline" className="col-span-3 h-12 justify-start">
                                                {icon && iconMap[icon] ? (
                                                    <div className="flex items-center gap-2">
                                                        {(() => {
                                                            const Icon = iconMap[icon];
                                                            return <Icon className="h-5 w-5 text-primary" />;
                                                        })()}
                                                        <span>{icon}</span>
                                                    </div>
                                                ) : (
                                                    <span>Selecione</span>
                                                )}
                                            </Button>
                                        </PopoverTrigger>
                                        <PopoverContent className="w-80">
                                            <div className="grid grid-cols-5 gap-2">
                                                {Object.keys(iconMap).map((key) => {
                                                    const IconFn = iconMap[key];
                                                    return (
                                                        <div
                                                            key={key}
                                                            className={cn(
                                                                "h-10 w-10 flex items-center justify-center rounded-md cursor-pointer hover:bg-secondary transition-colors border",
                                                                icon === key ? "border-primary bg-primary/10" : "border-transparent"
                                                            )}
                                                            onClick={() => setIcon(key)}
                                                            title={key}
                                                        >
                                                            <IconFn className="h-5 w-5" />
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </PopoverContent>
                                    </Popover>
                                </div>
                            </div>
                            <DialogFooter className="gap-2 sm:justify-between">
                                {currentGoal && (
                                    <Button
                                        variant="destructive"
                                        onClick={handleDelete}
                                        className="gap-2"
                                    >
                                        <Trash2 className="h-4 w-4" />
                                        Excluir
                                    </Button>
                                )}
                                <Button onClick={handleSave}>Salvar</Button>
                            </DialogFooter>
                        </DialogContent>
                    </Dialog>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {goals.map((goal) => {
                        const IconComponent = iconMap[goal.icon] || Shield;
                        const percentage = Math.round((goal.current / goal.target) * 100);

                        return (
                            <Card key={goal.id} className="shadow-sm hover:shadow-md transition-all cursor-pointer" onClick={() => handleEdit(goal)}>
                                <CardContent className="p-6 space-y-4">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 rounded-xl bg-primary/10">
                                            <IconComponent className="h-6 w-6 text-primary" />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-semibold text-lg text-foreground">{goal.name}</p>
                                            <p className="text-sm text-muted-foreground">{goal.daysLeft} dias restantes</p>
                                        </div>
                                        <span className="text-lg font-bold text-primary">{percentage}%</span>
                                    </div>

                                    <Progress value={percentage} className="h-2" />

                                    <div className="flex justify-between text-sm pt-2">
                                        <div className="flex flex-col">
                                            <span className="text-muted-foreground text-xs">Atual</span>
                                            <span className="font-medium text-foreground">
                                                {goal.current.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-muted-foreground text-xs">Meta</span>
                                            <span className="font-medium text-foreground">
                                                {goal.target.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                            </span>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })}
                </div>
            </div>
        </div>
    );
};

export default Goals;
