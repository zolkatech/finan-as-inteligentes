
import { supabase } from "@/lib/supabase";

export const googleCalendarService = {
    /**
     * Retrieves the provider token from the current session.
     * Note: This requires the user to be logged in with Google.
     */
    async getAccessToken() {
        const { data: { session } } = await supabase.auth.getSession();
        if (!session || !session.provider_token) {
            // Tenta recuperar do storage local se não estiver na sessão explícita (pode acontecer em refresh)
            // Mas o ideal é que o login tenha sido feito com escopos corretos.
            return null;
        }
        return session.provider_token;
    },

    /**
     * Lists events from the primary calendar.
     */
    async listEvents() {
        const token = await this.getAccessToken();
        if (!token) throw new Error("Google Access Token not found. Please log in with Google.");

        const now = new Date();
        const minDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(); // 1 month ago

        const params = new URLSearchParams({
            calendarId: 'primary',
            timeMin: minDate,
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '250',
        });

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            throw new Error(`Google Calendar API Error: ${response.statusText}`);
        }

        const data = await response.json();
        return data.items || [];
    },

    /**
     * Creates an event in the primary calendar.
     */
    async createEvent(event: { summary: string; description?: string; start: Date; end: Date; location?: string }) {
        const token = await this.getAccessToken();
        if (!token) throw new Error("Google Access Token not found. Please log in with Google.");

        const googleEvent = {
            summary: event.summary,
            description: event.description,
            location: event.location,
            start: {
                dateTime: event.start.toISOString(),
            },
            end: {
                dateTime: event.end.toISOString(),
            },
        };

        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events`, {
            method: 'POST',
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(googleEvent),
        });

        if (!response.ok) {
            const errorBody = await response.text();
            console.error("Google Calendar API Error Body:", errorBody);
            throw new Error(`Failed to create event in Google Calendar: ${response.statusText}`);
        }

        return await response.json();
    }
};
