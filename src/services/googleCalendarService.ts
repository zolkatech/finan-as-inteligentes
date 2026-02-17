
import { supabase } from "@/lib/supabase";

export const googleCalendarService = {
    /**
     * Retrieves the provider token from the current session.
     * Note: This requires the user to be logged in with Google.
     */
    async getAccessToken() {
        console.log("googleCalendarService: Getting access token...");
        const { data: { user } } = await supabase.auth.getUser();
        if (!user) {
            console.error("googleCalendarService: No user found.");
            return null;
        }

        try {
            console.log("googleCalendarService: Invoking Edge Function for user:", user.id);
            const { data, error } = await supabase.functions.invoke('google-calendar', {
                body: {
                    action: 'get_token',
                    user_id: user.id
                }
            });

            if (error) {
                console.error("googleCalendarService: Edge Function Error:", error);
                return null;
            }

            if (!data?.access_token) {
                console.warn("googleCalendarService: No access_token returned from Edge Function.", data);
                return null;
            }

            console.log("googleCalendarService: Token retrieved successfully.");
            return data.access_token;
        } catch (err) {
            console.error("Error invoking google-calendar function:", err);
            return null;
        }
    },

    /**
     * Lists events from the primary calendar.
     */
    async listEvents() {
        console.log("googleCalendarService: listEvents called.");
        const token = await this.getAccessToken();
        if (!token) {
            console.error("googleCalendarService: No token available. Aborting listEvents.");
            // throw new Error("Google Access Token not found. Please log in with Google.");
            return []; // Return empty array instead of throwing to avoid crashing UI if just not connected
        }

        const now = new Date();
        const minDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString(); // 1 month ago

        const params = new URLSearchParams({
            calendarId: 'primary',
            timeMin: minDate,
            singleEvents: 'true',
            orderBy: 'startTime',
            maxResults: '250',
        });

        console.log("googleCalendarService: Fetching from Google API...");
        const response = await fetch(`https://www.googleapis.com/calendar/v3/calendars/primary/events?${params}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        if (!response.ok) {
            console.error(`googleCalendarService: Google API Error: ${response.status} ${response.statusText}`);
            // throw new Error(`Google Calendar API Error: ${response.statusText}`);
            return [];
        }

        const data = await response.json();
        console.log(`googleCalendarService: Fetched ${data.items?.length} events.`);
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
