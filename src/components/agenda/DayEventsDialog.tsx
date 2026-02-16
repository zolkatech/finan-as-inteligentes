import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Clock, Calendar as CalendarIcon } from "lucide-react";
import { CalendarEvent } from "./EventDialog";

interface DayEventsDialogProps {
    isOpen: boolean;
    onClose: () => void;
    date: Date;
    events: CalendarEvent[];
    onEventClick: (event: CalendarEvent) => void;
}

export function DayEventsDialog({
    isOpen,
    onClose,
    date,
    events,
    onEventClick,
}: DayEventsDialogProps) {
    const sortedEvents = [...events].sort((a, b) => a.start.getTime() - b.start.getTime());

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle className="capitalize">
                        Eventos de {format(date, "EEEE, d 'de' MMMM", { locale: ptBR })}
                    </DialogTitle>
                </DialogHeader>
                <div className="py-4 space-y-4 max-h-[60vh] overflow-y-auto">
                    {sortedEvents.length > 0 ? (
                        sortedEvents.map((event) => (
                            <div
                                key={event.id}
                                className="group flex flex-col gap-1 p-3 rounded-lg border border-border/50 bg-secondary/10 hover:bg-secondary/30 transition-all cursor-pointer hover:border-primary/50"
                                onClick={() => {
                                    onClose();
                                    onEventClick(event);
                                }}
                                style={{
                                    borderLeft: `3px solid ${event.color || "#3b82f6"}`,
                                }}
                            >
                                <div className="flex items-center text-xs font-medium text-muted-foreground">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                                </div>
                                <h4 className="font-medium text-foreground text-sm">{event.title}</h4>
                                {event.desc && (
                                    <p className="text-xs text-muted-foreground line-clamp-1 mt-1">
                                        {event.desc}
                                    </p>
                                )}
                            </div>
                        ))
                    ) : (
                        <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50 py-8">
                            <CalendarIcon className="h-10 w-10 mb-2 stroke-1" />
                            <p className="text-sm text-center">Nenhum evento para este dia</p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
}
