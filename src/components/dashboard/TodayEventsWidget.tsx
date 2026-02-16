import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Clock } from "lucide-react";
import { format } from "date-fns";
import { CalendarEvent } from "@/components/agenda/EventDialog";

interface TodayEventsWidgetProps {
    events: CalendarEvent[];
}

const TodayEventsWidget = ({ events }: TodayEventsWidgetProps) => {
    const displayedEvents = events.slice(0, 5); // Show first 5 events

    return (
        <Card className="shadow-sm border-0 h-full">
            <CardHeader className="pb-3">
                <CardTitle className="text-lg font-semibold">Eventos de Hoje</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
                {displayedEvents.length > 0 ? (
                    displayedEvents.map((event) => (
                        <div
                            key={event.id}
                            className="flex items-center gap-3 p-3 bg-secondary/50 rounded-xl hover:bg-secondary transition-colors"
                            style={{ borderLeft: `3px solid ${event.color || "#3b82f6"}` }}
                        >
                            <div className="flex flex-col flex-1 min-w-0">
                                <span className="flex items-center text-xs font-medium text-muted-foreground mb-0.5">
                                    <Clock className="mr-1 h-3 w-3" />
                                    {format(event.start, "HH:mm")} - {format(event.end, "HH:mm")}
                                </span>
                                <p className="font-medium text-foreground truncate text-sm">
                                    {event.title}
                                </p>
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="flex flex-col items-center justify-center text-muted-foreground opacity-50 py-8">
                        <Clock className="h-8 w-8 mb-2 stroke-1" />
                        <p className="text-sm text-center">Nenhum evento hoje</p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
};

export default TodayEventsWidget;
