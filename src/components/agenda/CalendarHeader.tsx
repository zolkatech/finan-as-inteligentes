import { Button } from "@/components/ui/button";

import { ChevronLeft, ChevronRight, RefreshCw, Plus } from "lucide-react";

interface CalendarHeaderProps {
    date: Date;
    view: string;
    onNavigate: (action: "PREV" | "NEXT" | "TODAY") => void;
    onViewChange: (view: string) => void;
    onSync: () => void;
    onAddEvent: () => void;
}

export function CalendarHeader({
    date,
    view,
    onNavigate,
    onViewChange,
    onSync,
    onAddEvent,
}: CalendarHeaderProps) {
    const label = date.toLocaleString("pt-BR", {
        month: "long",
        year: "numeric",
    });

    return (
        <div className="flex flex-col sm:flex-row items-center justify-between pb-4 gap-4">
            {/* Left: Navigation Group */}
            <div className="flex items-center gap-4">
                <div className="flex items-center gap-1 bg-secondary/20 p-1 rounded-lg">
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("PREV")}>
                        <ChevronLeft className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="sm" className="h-7 px-3 text-xs font-medium" onClick={() => onNavigate("TODAY")}>
                        Hoje
                    </Button>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => onNavigate("NEXT")}>
                        <ChevronRight className="h-4 w-4" />
                    </Button>
                </div>
                <h2 className="text-xl font-bold capitalize text-foreground">{label}</h2>
            </div>

            {/* Right: Views & Actions */}
            <div className="flex items-center gap-3">
                {/* View Switcher - Tabs Style */}
                <div className="flex items-center bg-secondary/20 p-1 rounded-lg">
                    {["month", "week"].map((v) => (
                        <button
                            key={v}
                            onClick={() => onViewChange(v)}
                            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-all ${view === v
                                ? "bg-background text-foreground shadow-sm"
                                : "text-muted-foreground hover:text-foreground"
                                }`}
                        >
                            {v === "month" ? "Mês" : "Semana"}
                        </button>
                    ))}
                </div>

                <div className="h-6 w-px bg-border mx-1" />

                <div className="flex items-center gap-2">
                    <Button variant="outline" size="icon" onClick={onSync} title="Sincronizar">
                        <RefreshCw className="h-4 w-4" />
                    </Button>

                    <Button onClick={onAddEvent} className="gap-2">
                        <Plus className="h-4 w-4" />
                        <span className="hidden sm:inline">Novo Evento</span>
                    </Button>
                </div>
            </div>
        </div>
    );
}
