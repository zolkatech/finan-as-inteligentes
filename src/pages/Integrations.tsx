import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/lib/supabase";
import { useEffect, useState } from "react";
import { Check } from "lucide-react";
import { toast } from "sonner";
import { useGoogleConnection } from "@/hooks/useGoogleConnection";

const Integrations = () => {
    const { isConnected, loading, checkConnection } = useGoogleConnection();

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('calendar_connected') === 'true') {
            toast.success("Google Calendar conectado com sucesso!");
            // Remove param from URL
            window.history.replaceState({}, document.title, window.location.pathname);
            checkConnection();
        }
    }, [checkConnection]);

    const handleGoogleConnect = async () => {
        try {
            const { data: { user } } = await supabase.auth.getUser();
            if (!user) {
                toast.error("Você precisa estar logado para conectar o Google Calendar.");
                return;
            }

            // Configuration - You should move these to env vars
            const CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || "YOUR_GOOGLE_CLIENT_ID"; // Replace with your actual Client ID if not in env
            const REDIRECT_URI = "https://qybsmqjpmzlbxxstcqic.supabase.co/functions/v1/google-calendar"; // Your Edge Function URL

            // Validate configuration
            if (CLIENT_ID === "YOUR_GOOGLE_CLIENT_ID") {
                toast.error("Configuração de Client ID ausente. Verifique o console.");
                console.error("Missing VITE_GOOGLE_CLIENT_ID in .env");
                return;
            }

            const stateStr = JSON.stringify({
                userId: user.id,
                redirectTo: window.location.origin + '/integrations'
            });
            const state = btoa(stateStr); // Encode state to Base64

            const scope = "https://www.googleapis.com/auth/calendar";

            const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?` +
                `client_id=${CLIENT_ID}&` +
                `redirect_uri=${encodeURIComponent(REDIRECT_URI)}&` +
                `response_type=code&` +
                `scope=${encodeURIComponent(scope)}&` +
                `access_type=offline&` +
                `prompt=consent&` +
                `state=${state}`;

            window.location.href = authUrl;

        } catch (error: any) {
            console.error("Google Auth Error:", error);
            toast.error("Erro ao iniciar conexão com Google.");
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
