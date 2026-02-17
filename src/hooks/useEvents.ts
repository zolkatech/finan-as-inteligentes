
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarEvent } from "@/components/agenda/EventDialog";
import { toast } from "sonner";
import { googleCalendarService } from "@/services/googleCalendarService";

export function useEvents() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            setLoading(true);

            // 1. Fetch Supabase Events
            const { data: supabaseData, error: supabaseError } = await supabase
                .from("events")
                .select("*");

            if (supabaseError) {
                console.error("Error fetching events:", supabaseError);
                toast.error("Erro ao carregar eventos do sistema.");
            }

            let allEvents: CalendarEvent[] = [];

            if (supabaseData) {
                const formattedSupabaseEvents: CalendarEvent[] = supabaseData.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    desc: event.description,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                    color: event.color,
                }));
                allEvents = [...formattedSupabaseEvents];
            }

            // 2. Fetch Google Calendar Events (if connected)
            try {
                const googleEventsData = await googleCalendarService.listEvents();
                if (googleEventsData && googleEventsData.length > 0) {
                    const formattedGoogleEvents: CalendarEvent[] = googleEventsData.map((event: any) => {
                        const isAllDay = !!event.start.date;
                        let start, end;

                        if (isAllDay) {
                            // Fix for Google Calendar "date" fields (YYYY-MM-DD) being parsed as UTC
                            // We need them to be Local Time 00:00:00.
                            // Splitting by '-' avoids the browser's UTC parsing behavior for YYYY-MM-DD strings.
                            const [sYear, sMonth, sDay] = event.start.date.split('-').map(Number);
                            const [eYear, eMonth, eDay] = event.end.date.split('-').map(Number);

                            // Create date in local time (Month is 0-indexed)
                            start = new Date(sYear, sMonth - 1, sDay);
                            end = new Date(eYear, eMonth - 1, eDay);

                            // For all-day events, Google often returns end date as the next day.
                            // React-Big-Calendar expects inclusive/exclusive behavior differently depending on version, 
                            // but usually for 'allDay' flag it handles it. 
                        } else {
                            start = new Date(event.start.dateTime);
                            end = new Date(event.end.dateTime);
                        }

                        return {
                            id: event.id, // Google ID
                            title: event.summary,
                            desc: event.description || "",
                            start,
                            end,
                            color: "#DB4437", // Google Red
                            isGoogleEvent: true, // Marker to disable editing in our system if needed
                            allDay: isAllDay, // Tell React-Big-Calendar it's an all-day event
                        };
                    });

                    // Filter out Google events that are already in Supabase (Deduplication)
                    // We match by Title, Start Time, and End Time since we don't store the Google ID yet.
                    const uniqueGoogleEvents = formattedGoogleEvents.filter(gEvent => {
                        const isDuplicate = allEvents.some(sEvent =>
                            sEvent.title === gEvent.title &&
                            sEvent.start.getTime() === gEvent.start.getTime() &&
                            sEvent.end.getTime() === gEvent.end.getTime()
                        );
                        return !isDuplicate;
                    });

                    allEvents = [...allEvents, ...uniqueGoogleEvents];
                }
            } catch (error) {
                // Ignore errors here usually means not logged in with Google or no permissions
                // We just don't show Google events, no need to spam toast unless debugging
                console.log("Google Calendar fetch ignored:", error);
            }

            setEvents(allEvents);

        } catch (error) {
            console.error("Unexpected error:", error);
            toast.error("Erro inesperado ao carregar eventos.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEvents();

        // Optional: Subscribe to realtime changes
        const subscription = supabase
            .channel('events-changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'events' }, () => {
                fetchEvents();
            })
            .subscribe();

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const createEvent = async (event: Omit<CalendarEvent, "id">, addToGoogle = false) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Usuário não autenticado.");
                return;
            }

            // 1. Create in Supabase (Always, for record)
            const { data, error } = await supabase.from("events").insert([
                {
                    title: event.title,
                    description: event.desc,
                    start_time: event.start.toISOString(),
                    end_time: event.end.toISOString(),
                    color: event.color,
                    user_id: user.id
                },
            ]).select().single();

            if (error) {
                console.error("Error creating event:", error);
                toast.error("Erro ao criar evento.");
                throw error;
            }

            // 2. Add to Google Calendar (Optional)
            if (addToGoogle) {
                try {
                    await googleCalendarService.createEvent({
                        summary: event.title,
                        description: event.desc,
                        start: event.start,
                        end: event.end
                    });
                    toast.success("Evento criado no sistema e no Google Calendar!");
                } catch (e) {
                    console.error("Google Calendar Create Error", e);
                    toast.warning("Evento criado no sistema, mas falhou ao sincronizar com Google.");
                }
            } else {
                if (data) toast.success("Evento criado com sucesso!");
            }

            if (data) {
                // Refresh to show new event (and potentially duplicate if Google sync worked and we fetch both? 
                // Currently we don't link them ID-wise, so it might show twice if we fetch Google immediately.
                // For now simpler to just refresh).
                fetchEvents();
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            throw error;
        }
    };

    const updateEvent = async (event: CalendarEvent) => {
        try {
            if (event.isGoogleEvent) {
                toast.info("Edição de eventos do Google ainda não suportada (somente leitura).");
                return;
            }

            const { error } = await supabase
                .from("events")
                .update({
                    title: event.title,
                    description: event.desc,
                    start_time: event.start.toISOString(),
                    end_time: event.end.toISOString(),
                    color: event.color,
                })
                .eq("id", event.id);

            if (error) {
                console.error("Error updating event:", error);
                toast.error("Erro ao atualizar evento.");
                throw error;
            }

            setEvents((prev) => prev.map(e => e.id === event.id ? event : e));
            toast.success("Evento atualizado com sucesso!");
        } catch (error) {
            console.error("Unexpected error:", error);
            throw error;
        }
    };

    const deleteEvent = async (id: string) => {
        try {
            // Check if it's a google event (id structure is different usually, or we can check prop)
            const eventToDelete = events.find(e => e.id === id);
            if (eventToDelete?.isGoogleEvent) {
                toast.info("Remoção de eventos do Google deve ser feita no Google Calendar.");
                return;
            }

            const { error } = await supabase.from("events").delete().eq("id", id);

            if (error) {
                console.error("Error deleting event:", error);
                toast.error("Erro ao remover evento.");
                throw error;
            }

            setEvents((prev) => prev.filter(e => e.id !== id));
            toast.success("Evento removido com sucesso!");
        } catch (error) {
            console.error("Unexpected error:", error);
            throw error;
        }
    };

    return {
        events,
        loading,
        createEvent,
        updateEvent,
        deleteEvent,
        refreshEvents: fetchEvents
    };
}
