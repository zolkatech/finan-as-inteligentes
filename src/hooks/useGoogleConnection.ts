import { useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';

export const useGoogleConnection = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    const checkConnection = async (userId?: string) => {
        try {
            // If we're already checking (loading is true) but we want to force a check, we might want to be careful. 
            // But here we'll just set loading true.
            // setLoader only if not already connected to avoid flicker? 
            // actually we want to show loading state if we are unsure.

            const currentSession = await supabase.auth.getSession();
            const session = currentSession.data.session;
            const user = session?.user;
            const currentUserId = userId || user?.id;

            console.log("Checking connection for:", currentUserId);

            if (session?.provider_token) {
                console.log("Provider token found");
                setIsConnected(true);
                setLoading(false);
                return;
            }

            if (currentUserId) {
                const { data, error } = await supabase
                    .from('google_integrations')
                    .select('id')
                    .eq('user_id', currentUserId)
                    .single(); // Use single() to expect one row

                console.log("DB Check:", { data, error });

                if (data && !error) {
                    setIsConnected(true);
                } else {
                    setIsConnected(false);
                }
            } else {
                console.log("No user to check");
                setIsConnected(false);
            }
        } catch (error) {
            console.error("Error checking Google connection:", error);
            setIsConnected(false);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial Check
        checkConnection();

        // Listen for Auth Changes
        const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
            console.log("Auth Event:", event);
            if (session?.user) {
                await checkConnection(session.user.id);
            } else {
                setIsConnected(false);
                setLoading(false);
            }
        });

        // Realtime Subscription
        const channel = supabase
            .channel('google-integrations-changes')
            .on(
                'postgres_changes',
                {
                    event: '*',
                    schema: 'public',
                    table: 'google_integrations'
                },
                (payload) => {
                    console.log('Realtime change:', payload);
                    // Re-check connection on any change to this table
                    // We could inspect payload to see if it matches current user, 
                    // but calling checkConnection is safer and easier.
                    checkConnection();
                }
            )
            .subscribe();

        return () => {
            authListener.subscription.unsubscribe();
            supabase.removeChannel(channel);
        };
    }, []);

    return { isConnected, loading, checkConnection };
};
