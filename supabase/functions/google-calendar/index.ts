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
        const REDIRECT_URI = Deno.env.get('GOOGLE_REDIRECT_URI'); // e.g. http://localhost:3000/integrations or https://myapp.com/integrations

        if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
            throw new Error('Google Client configuration missing in Edge Function');
        }

        // 1. Exchange Authorization Code (Manual Flow) OR Save Tokens (From Supabase Auth)
        if (action === 'exchange' || action === 'save_token') {
            let accessToken, refreshToken, expiresIn, userIdInput;

            if (action === 'exchange') {
                const { code, user_id, redirect_uri } = await req.json();
                if (!code || !user_id) throw new Error('Missing code or user_id');
                userIdInput = user_id;

                // Exchange code for tokens
                const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
                    body: new URLSearchParams({
                        code,
                        client_id: GOOGLE_CLIENT_ID,
                        client_secret: GOOGLE_CLIENT_SECRET,
                        redirect_uri: redirect_uri || REDIRECT_URI,
                        grant_type: 'authorization_code',
                    }),
                });

                const tokens = await tokenResponse.json();
                if (tokens.error) {
                    console.error('Google Token Exchange Error:', tokens);
                    throw new Error(`Google Error: ${tokens.error_description || tokens.error}`);
                }
                accessToken = tokens.access_token;
                refreshToken = tokens.refresh_token;
                expiresIn = tokens.expires_in;
            } else {
                // action === 'save_token'
                const { access_token, refresh_token, expires_in, user_id } = await req.json();
                if (!access_token || !user_id) throw new Error('Missing access_token or user_id');
                // Note: refresh_token might be null if user logged in before without prompt=consent
                userIdInput = user_id;
                accessToken = access_token;
                refreshToken = refresh_token;
                expiresIn = expires_in || 3599;
            }

            // Check for refresh token logic
            if (!refreshToken && action === 'exchange') {
                console.warn('No refresh_token returned in exchange.');
            }

            // Save to database
            const upsertData: any = {
                user_id: userIdInput,
                access_token: accessToken,
                expires_at: Date.now() + (expiresIn * 1000),
                updated_at: new Date().toISOString(),
            };

            // Only update refresh_token if we actually got one (don't overwrite with null)
            if (refreshToken) {
                upsertData.refresh_token = refreshToken;
            }

            const { error: dbError } = await supabaseClient
                .from('google_integrations')
                .upsert(upsertData, { onConflict: 'user_id' });

            if (dbError) throw dbError;

            return new Response(JSON.stringify({ success: true }), {
                headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            });
        }

        // 2. Get Valid Token (Refresh if needed) - Used by AI Agents / Backend
        if (action === 'get_token') {
            const { user_id } = await req.json();
            if (!user_id) throw new Error('Missing user_id');

            // Fetch stored tokens
            const { data: integration, error: fetchError } = await supabaseClient
                .from('google_integrations')
                .select('*')
                .eq('user_id', user_id)
                .single();

            if (fetchError || !integration) {
                return new Response(JSON.stringify({ error: 'No integration found' }), { status: 404, headers: corsHeaders });
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

        throw new Error('Invalid action');

    } catch (error: any) {
        console.error('Edge Function Error:', error);
        return new Response(JSON.stringify({ error: error.message }), {
            status: 400,
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
    }
});
