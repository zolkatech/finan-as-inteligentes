
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import { CalendarEvent } from "@/components/agenda/EventDialog";
import { toast } from "sonner";

export function useEvents() {
    const [events, setEvents] = useState<CalendarEvent[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEvents = async () => {
        try {
            setLoading(true);
            const { data, error } = await supabase
                .from("events")
                .select("*");

            if (error) {
                console.error("Error fetching events:", error);
                toast.error("Erro ao carregar eventos.");
                return;
            }

            if (data) {
                const formattedEvents: CalendarEvent[] = data.map((event: any) => ({
                    id: event.id,
                    title: event.title,
                    desc: event.description,
                    start: new Date(event.start_time),
                    end: new Date(event.end_time),
                    color: event.color,
                }));
                setEvents(formattedEvents);
            }
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

    const createEvent = async (event: Omit<CalendarEvent, "id">) => {
        try {
            const { data: { user } } = await supabase.auth.getUser();

            if (!user) {
                toast.error("Usuário não autenticado.");
                return;
            }

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

            if (data) {
                const newEvent: CalendarEvent = {
                    id: data.id,
                    title: data.title,
                    desc: data.description,
                    start: new Date(data.start_time),
                    end: new Date(data.end_time),
                    color: data.color,
                };
                setEvents((prev) => [...prev, newEvent]);
                toast.success("Evento criado com sucesso!");
            }
        } catch (error) {
            console.error("Unexpected error:", error);
            throw error;
        }
    };

    const updateEvent = async (event: CalendarEvent) => {
        try {
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
