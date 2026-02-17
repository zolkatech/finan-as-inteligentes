import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders });
    }

    try {
        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        );

        const url = new URL(req.url);
        const action = url.searchParams.get('action'); // 'exchange' or 'refresh' or 'get_token'

        // Configuration
        const GOOGLE_CLIENT_ID = Deno.env.get('GOOGLE_CLIENT_ID');
        const GOOGLE_CLIENT_SECRET = Deno.env.get('GOOGLE_CLIENT_SECRET');
        // const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI'); // Using FUNCTION_REDIRECT_URI inside callback

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            throw new Error('Google Client configuration missing in Edge Function');
        }

        // ==========================================
        // 1. PUBLIC ROUTE: OAuth Callback (GET)
        // ==========================================
        if (req.method === 'GET' && url.searchParams.get('code')) {
            const code = url.searchParams.get('code');
            const state = url.searchParams.get('state');

            if (!code || !state) {
                return new Response("Missing code or state", { status: 400 });
            }

            let userIdInput;
            let redirectTo = "http://localhost:5173/integrations"; // Default fallback

            try {
                // Decode state
                const decodedState = JSON.parse(atob(state));
                userIdInput = decodedState.userId;
                if (decodedState.redirectTo) {
                    redirectTo = decodedState.redirectTo;
                }
            } catch (e) {
                console.error("Failed to decode state:", e);
                // Fallback: assume state is just user_id (legacy or simple string)
                userIdInput = state;
            }

            if (!userIdInput) {
                return new Response("Invalid state (missing user_id)", { status: 400 });
            }

            console.log(`Processing callback for user: ${userIdInput}`);

            // Exchange code for tokens
            // NOTE: The redirect_uri passed here MUST match the one used in the frontend to generate the auth code.
            // In this manual flow, it is THIS Edge Function's URL.
            // e.g. https://<project>.supabase.co/functions/v1/google-calendar
            const FUNCTION_REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI');

            if (!FUNCTION_REDIRECT_URI) {
                console.error("Missing GOOGLE_REDIRECT_URI env var (should be this function's URL)");
                return new Response("Server Configuration Error", { status: 500 });
            }

            const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                method: 'POST',
                headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                body: new URLSearchParams({
                    code,
                    client_id: GOOGLE_CLIENT_ID,
                    client_secret: GOOGLE_CLIENT_SECRET,
                    redirect_uri: FUNCTION_REDIRECT_URI,
                    grant_type: 'authorization_code',
                }),
            });

            const tokens = await tokenResponse.json();
            if (tokens.error) {
                console.error('Google Token Exchange Error:', tokens);
                return new Response(`Google Error: ${tokens.error_description || tokens.error}`, { status: 400 });
            }

            const accessToken = tokens.access_token;
            const refreshToken = tokens.refresh_token; // Important: Make sure access_type=offline was sent
            const expiresIn = tokens.expires_in;

            // Save to database (Using Service Role - User is verified via OAuth State indirectly)
            const upsertData: any = {
                user_id: userIdInput,
                access_token: accessToken,
                expires_at: Date.now() + (expiresIn * 1000),
                updated_at: new Date().toISOString(),
            };

            if (refreshToken) {
                upsertData.refresh_token = refreshToken;
            } else {
                console.warn("No refresh_token received. User might need to revoke access to get it again.");
            }

            const { error: dbError } = await supabaseClient
                .from('google_integrations')
                .upsert(upsertData, { onConflict: 'user_id' });

            if (dbError) {
                console.error("Database Error:", dbError);
                return new Response("Database Error", { status: 500 });
            }

            // Redirect back to App
            const successUrl = new URL(redirectTo);
            successUrl.searchParams.set('calendar_connected', 'true');

            return Response.redirect(successUrl.toString(), 302);
        }

        // ==========================================
        // 2. PROTECTED ROUTES (POST)
        // ==========================================
        if (req.method === 'POST') {
            // Manual JWT Verification
            const authHeader = req.headers.get('Authorization');
            if (!authHeader) {
                return new Response(JSON.stringify({ error: 'Missing Authorization header' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            const token = authHeader.replace('Bearer ', '');
            const anonClient = createClient(
                Deno.env.get('SUPABASE_URL') ?? '',
                Deno.env.get('SUPABASE_ANON_KEY') ?? ''
            );

            const { data: { user }, error: authError } = await anonClient.auth.getUser(token);

            if (authError || !user) {
                return new Response(JSON.stringify({ error: 'Unauthorized', details: authError }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            const body = await req.json();

            // Fallback: If action was not in URL (GET), check if it is in BODY (POST)
            let currentAction = action;
            if (!currentAction && body.action) {
                currentAction = body.action;
            }

            // Enforce that the requested operation is for the authenticated user
            // We expect 'user_id' in the body for these actions
            if (body.user_id && body.user_id !== user.id) {
                return new Response(JSON.stringify({ error: 'Forbidden: User ID mismatch' }), { status: 403, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
            }

            // --- Action: Save Token (Legacy/Manual API call) ---
            if (currentAction === 'save_token') {
                const { access_token, refresh_token, expires_in, user_id } = body;
                if (!access_token || !user_id) throw new Error('Missing access_token or user_id');

                const upsertData: any = {
                    user_id: user_id,
                    access_token: access_token,
                    expires_at: Date.now() + ((expires_in || 3599) * 1000),
                    updated_at: new Date().toISOString(),
                };

                if (refresh_token) upsertData.refresh_token = refresh_token;

                const { error: dbError } = await supabaseClient
                    .from('google_integrations')
                    .upsert(upsertData, { onConflict: 'user_id' });

                if (dbError) throw dbError;

                return new Response(JSON.stringify({ success: true }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }

            // --- Action: Get Valid Token (Refresh if needed) - Used by AI Agents / Backend ---
            if (currentAction === 'get_token') {
                const { user_id } = body;
                if (!user_id) throw new Error('Missing user_id');

                // Fetch stored tokens
                const { data: integration, error: fetchError } = await supabaseClient
                    .from('google_integrations')
                    .select('*')
                    .eq('user_id', user_id)
                    .single();

                if (fetchError || !integration) {
                    return new Response(JSON.stringify({ error: 'No integration found' }), { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
                }

                // Check expiration (buffer of 5 minutes)
                const now = Date.now();
                const isExpired = !integration.access_token || (integration.expires_at - 300000) < now;

                if (isExpired) {
                    if (!integration.refresh_token) {
                        throw new Error('Access token expired and no refresh token available. User must re-connect.');
                    }

                    console.log(`Refreshing token for user ${user_id}...`);

                    // Refresh Token Request
                    const refreshResponse = await fetch('https://oauth2.googleapis.com/token', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                        body: new URLSearchParams({
                            client_id: GOOGLE_CLIENT_ID,
                            client_secret: GOOGLE_CLIENT_SECRET,
                            refresh_token: integration.refresh_token,
                            grant_type: 'refresh_token',
                        }),
                    });

                    const newTokens = await refreshResponse.json();

                    if (newTokens.error) {
                        console.error('Token Refresh Error:', newTokens);
                        // If refresh token is invalid (revoked), we might want to delete the row or mark as disconnected
                        throw new Error(`Failed to refresh token: ${newTokens.error}`);
                    }

                    // Update DB
                    const { error: updateError } = await supabaseClient
                        .from('google_integrations')
                        .update({
                            access_token: newTokens.access_token,
                            expires_at: Date.now() + (newTokens.expires_in * 1000),
                            updated_at: new Date().toISOString(),
                        })
                        .eq('user_id', user_id);

                    if (updateError) throw updateError;

                    return new Response(JSON.stringify({ access_token: newTokens.access_token }), {
                        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                    });
                }

                // Token is valid
                return new Response(JSON.stringify({ access_token: integration.access_token }), {
                    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
                });
            }
        }

        // If no match
        return new Response("Method not allowed or Action not found", { status: 405, headers: corsHeaders });


    } catch (error: any) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
