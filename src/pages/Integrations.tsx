import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";

const Integrations = () => {
    const [isConnected, setIsConnected] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        checkConnection();
    }, []);

    const checkConnection = async () => {
        const { data: { session } } = await supabase.auth.getSession();

        // Check if we have a provider token in the session (active login)
        if (session?.provider_token) {
            setIsConnected(true);

            // Try to save tokens to backend
            // We do this if we haven't checked before or just to ensure sync.
            // Ideally we check if we already saved it to avoid spamming the API? 
            // For now, let's just do it and rely on the UI feedback.

            console.log("Session Tokens:", {
                access: !!session.provider_token,
                refresh: !!session.provider_refresh_token
            });

            if (session.provider_token) {
                try {
                    // Toast for debugging/feedback
                    if (session.provider_refresh_token) {
                        toast.info("Refresh Token detectado! Salvando...");
                    } else {
                        toast.warning("Refresh Token não detectado. A conexão pode expirar.");
                    }

                    const { error } = await supabase.functions.invoke('google-calendar', {
                        body: {
                            action: 'save_token',
                            user_id: session.user.id,
                            access_token: session.provider_token,
                            refresh_token: session.provider_refresh_token || null,
                            expires_in: session.expires_in
                        }
                    });

                    if (error) throw error;
                    console.log("Tokens saved successfully.");
                    if (session.provider_refresh_token) toast.success("Conexão persistente salva com sucesso!");

                } catch (err) {
                    console.error("Failed to save tokens persistence:", err);
                    toast.error("Falha ao salvar conexão persistente.");
                }
            }
        } else {
            // ... existing fallback code ...
            const { data: { user } } = await supabase.auth.getUser();
            if (user) {
                const { data, error } = await supabase
                    .from('google_integrations')
                    .select('id')
                    .eq('user_id', user.id)
                    .single();

                if (data && !error) {
                    setIsConnected(true);
                }
            }
        }

        setLoading(false);
    };

    const handleGoogleConnect = async () => {
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider: 'google',
                options: {
                    queryParams: {
                        access_type: 'offline',
                        prompt: 'consent',
                    },
                    scopes: 'https://www.googleapis.com/auth/calendar',
                    redirectTo: window.location.origin + '/integrations',
                },
            });

            if (error) throw error;
        } catch (error: any) {
            console.error("Google Auth Error:", error);
        }
    };

    return (
        <div className="p-6 space-y-6">
            <h1 className="text-3xl font-bold text-foreground">Integrações</h1>

            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                {/* Google Calendar Integration */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            Google Calendar
                        </CardTitle>
                        <CardDescription>
                            Sincronize seus eventos automaticamente com o Google Calendar.
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        {isConnected ? (
                            <Button className="w-full bg-green-600 hover:bg-green-700 text-white cursor-default" disabled>
                                <Check className="mr-2 h-4 w-4" />
                                Conectado
                            </Button>
                        ) : (
                            <Button
                                onClick={handleGoogleConnect}
                                variant="outline"
                                className="w-full flex items-center justify-center gap-2"
                                disabled={loading}
                            >
                                <svg className="h-5 w-5" viewBox="0 0 24 24">
                                    <path
                                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                        fill="#4285F4"
                                    />
                                    <path
                                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                        fill="#34A853"
                                    />
                                    <path
                                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.26.81-.58z"
                                        fill="#FBBC05"
                                    />
                                    <path
                                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                                        fill="#EA4335"
                                    />
                                </svg>
                                Conectar com Google
                            </Button>
                        )}
                    </CardContent>
                </Card>
            </div>
        </div>
    );
};

export default Integrations;
