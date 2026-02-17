import { useState, useCallback } from "react";
import { Calendar, dateFnsLocalizer, Views } from "react-big-calendar";
import { format, parse, startOfWeek, getDay, isSameDay } from "date-fns";
import { ptBR } from "date-fns/locale";
import "react-big-calendar/lib/css/react-big-calendar.css";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Toaster, toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarIcon, Clock, Plus, Loader2 } from "lucide-react";

import { CalendarHeader } from "@/components/agenda/CalendarHeader";
import { EventDialog, CalendarEvent } from "@/components/agenda/EventDialog";
import { DayEventsDialog } from "@/components/agenda/DayEventsDialog";
import { useTheme } from "next-themes";
import "@/components/agenda/calendar-custom.css";
import { useEvents } from "@/hooks/useEvents";

const locales = {
    "pt-BR": ptBR,
};

const localizer = dateFnsLocalizer({
    format: (date: Date, formatStr: string, culture: string) => {
        return format(date, formatStr, { locale: locales[culture as keyof typeof locales] || ptBR })
    },
    parse: (str: string, formatStr: string, culture: string) => {
        return parse(str, formatStr, new Date(), { locale: locales[culture as keyof typeof locales] || ptBR })
    },
    startOfWeek: (date: Date, culture: string) => {
        return startOfWeek(date, { locale: locales[culture as keyof typeof locales] || ptBR })
    },
    getDay,
    locales,
});

export default function Agenda() {
    const [view, setView] = useState(Views.MONTH);
    const [date, setDate] = useState(new Date());

    // [MODIFIED] Use the custom hook for events
    const { events, loading, createEvent, updateEvent, deleteEvent, refreshEvents } = useEvents();

    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
    const [selectedSlot, setSelectedSlot] = useState<{ start: Date; end: Date } | null>(null);
    const [isDayViewOpen, setIsDayViewOpen] = useState(false);
    const [selectedDayDate, setSelectedDayDate] = useState<Date>(new Date());

    const { theme } = useTheme();

    const handleNavigate = useCallback((action: "PREV" | "NEXT" | "TODAY") => {
        if (action === "TODAY") {
            setDate(new Date());
        } else if (action === "PREV") {
            const newDate = new Date(date);
            if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() - 1);
            else if (view === Views.WEEK) newDate.setDate(newDate.getDate() - 7);
            else if (view === Views.DAY) newDate.setDate(newDate.getDate() - 1);
            setDate(newDate);

        } else if (action === "NEXT") {
            const newDate = new Date(date);
            if (view === Views.MONTH) newDate.setMonth(newDate.getMonth() + 1);
            else if (view === Views.WEEK) newDate.setDate(newDate.getDate() + 7);
            else if (view === Views.DAY) newDate.setDate(newDate.getDate() + 1);
            setDate(newDate);
        }
    }, [date, view]);

    // Use calendar's native navigation callback to sync state
    const onNavigateRaw = (newDate: Date) => setDate(newDate);

    const handleSelectSlot = useCallback((slotInfo: { start: Date; end: Date }) => {
        setDate(slotInfo.start);
        setSelectedDayDate(slotInfo.start);
        setIsDayViewOpen(true);
    }, []);

    const handleSelectEvent = useCallback((event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedSlot(null);
        setIsDialogOpen(true);
    }, []);

    const handleEditEvent = (event: CalendarEvent) => {
        setSelectedEvent(event);
        setSelectedSlot(null);
        setIsDialogOpen(true);
    };

    const handleSaveEvent = async (event: CalendarEvent, addToGoogle = false) => {
        if (selectedEvent) {
            await updateEvent(event);
        } else {
            // New event, potentially add to Google
            await createEvent(event, addToGoogle);
        }
        setIsDialogOpen(false);
    };

    const handleDeleteEvent = async (id: string) => {
        await deleteEvent(id);
    };

    const handleSync = async () => {
        toast.info("Sincronizando eventos...");
        await refreshEvents(); // Re-fetches both Supabase and Google events
        toast.success("Sincronização concluída!");
    };

    const eventStyleGetter = (event: CalendarEvent) => {
        const backgroundColor = event.color || "#3b82f6";
        return {
            style: {
                backgroundColor,
                borderRadius: "4px",
                opacity: 0.8,
                color: "white",
                border: "0px",
                display: "block",
            },
        };
    };

    // Custom Date Header to highlight 'Today' with a circle
    const CustomDateHeader = ({ label, date }: { label: string; date: Date }) => {
        const isToday = isSameDay(date, new Date());
        return (
            <div className="rbc-date-cell">
                <span
                    className={`inline-flex items-center justify-center w-7 h-7 rounded-full text-xs font-semibold ${isToday ? "bg-primary text-primary-foreground" : "text-muted-foreground"
                        }`}
                >
                    {label}
                </span>
            </div>
        );
    };

    return (
        <div className="h-[calc(100vh-100px)] p-6 flex flex-col lg:flex-row gap-6">
            {/* Main Calendar Area - Takes up available space */}
            <Card className="flex-1 p-6 flex flex-col bg-card border-border shadow-sm min-w-0 relative">
                {loading && (
                    <div className="absolute inset-0 bg-background/50 flex items-center justify-center z-10 backdrop-blur-sm">
                        <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    </div>
                )}
                <CalendarHeader
                    date={date}
                    view={view}
                    onNavigate={handleNavigate}
                    onViewChange={(v) => setView(v as any)}
                    onSync={handleSync}
                    onAddEvent={() => {
                        setSelectedEvent(null);
                        setSelectedSlot({ start: new Date(), end: new Date(new Date().setHours(new Date().getHours() + 1)) });
                        setIsDialogOpen(true);
                    }}
                />

                <div className="flex-1 calendar-container min-h-[500px]">
                    <Calendar
                        localizer={localizer}
                        events={events}
                        startAccessor="start"
                        endAccessor="end"
                        style={{ height: "100%" }}
                        view={view}
                        date={date}
                        onNavigate={onNavigateRaw}
                        onView={setView as any}
                        onSelectSlot={handleSelectSlot}
                        onSelectEvent={handleSelectEvent}
                        selectable
                        eventPropGetter={eventStyleGetter}
                        components={{
                            month: {
                                dateHeader: CustomDateHeader,
                            },
                        }}
                        messages={{
                            next: "Próximo",
                            previous: "Anterior",
                            today: "Hoje",
                            month: "Mês",
                            week: "Semana",
                            day: "Dia",
                            agenda: "Agenda",
                            date: "Data",
                            time: "Hora",
                            event: "Evento",
                            noEventsInRange: "Não há eventos neste período.",
                        }}
                        culture="pt-BR"
                        toolbar={false}
                    />
                </div>
            </Card>

            {/* Side Widget - Day Events - Fixed width on large screens */}
            <Card className="lg:w-[320px] flex-none flex flex-col bg-card border-border shadow-sm h-full max-h-[calc(100vh-148px)]">
                <CardHeader className="py-4 border-b border-border flex flex-row items-center justify-between">
                    <div className="flex flex-col gap-1">
                        <CardTitle className="text-xl font-bold text-primary">
                            Eventos de hoje
                        </CardTitle>
                        <p className="text-xs font-medium text-muted-foreground capitalize">
                            {format(new Date(), "EEEE, d 'de' MMMM", { locale: ptBR })}
                        </p>
                    </div>
                    <Button variant="ghost" size="icon" onClick={() => {
                        setSelectedEvent(null);
                        const start = new Date(); // Default to Now/Today
                        start.setHours(9, 0, 0, 0);
                        const end = new Date();
                        end.setHours(10, 0, 0, 0);
                        setSelectedSlot({ start, end });
                        setIsDialogOpen(true);
                    }}>
                        <Plus className="h-5 w-5" />
                    </Button>
                </CardHeader>
                <CardContent className="flex-1 overflow-y-auto p-4 space-y-3">
                    {/* Filter for TODAY, not 'date' state */}
                    {loading ? (
                        <div className="flex justify-center p-4">
                            <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
                        </div>
                    ) : events.filter(event => isSameDay(event.start, new Date())).sort((a, b) => a.start.getTime() - b.start.getTime()).length > 0 ? (
                        events.filter(event => isSameDay(event.start, new Date())).sort((a, b) => a.start.getTime() - b.start.getTime()).map((event) => (
                            <div
                                key={event.id}
                                className="group flex flex-col gap-1 p-3 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer hover:border-primary/50"
                                onClick={() => handleEditEvent(event)}
                                style={{ borderLeft: `3px solid ${event.color || "#3b82f6"}` }}
                            >
                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                                </div>
                                <h4 className="font-medium text-foreground text-sm line-clamp-1">{event.title}</h4>
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50 py-8">
                            <CalendarIcon className="h-8 w-8 mb-2 stroke-1" />
                            <p className="text-sm text-center">Nenhum evento para hoje</p>
                        </div>
                    )}
                </CardContent>
            </Card>

            <DayEventsDialog
                isOpen={isDayViewOpen}
                onClose={() => setIsDayViewOpen(false)}
                date={selectedDayDate}
                events={events.filter(e => isSameDay(e.start, selectedDayDate))}
                onEventClick={handleEditEvent}
            />

            <EventDialog
                isOpen={isDialogOpen}
                onClose={() => setIsDialogOpen(false)}
                onSave={handleSaveEvent}
                onDelete={handleDeleteEvent}
                selectedEvent={selectedEvent}
                selectedSlot={selectedSlot}
            />
        </div>
    );
}
