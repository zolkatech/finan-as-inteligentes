// @ts-nocheck
import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from "https://esm.sh/@supabase/supabase-js@2"

const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
    if (req.method === 'OPTIONS') {
        return new Response('ok', { headers: corsHeaders })
    }

    try {
        console.log("Starting admin-create-user function");

        const supabaseClient = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_ANON_KEY') ?? '',
            { global: { headers: { Authorization: req.headers.get('Authorization')! } } }
        )

        const {
            data: { user },
        } = await supabaseClient.auth.getUser()

        if (!user) {
            console.error("User not found or unauthorized");
            return new Response("Unauthorized", { status: 401, headers: corsHeaders })
        }

        console.log("Request user:", user.id);

        const { data: profile } = await supabaseClient
            .from('profiles')
            .select('role')
            .eq('id', user.id)
            .single()

        if (profile?.role !== 'admin') {
            console.error("User is not admin:", profile?.role);
            return new Response("Forbidden: Admin access required", { status: 403, headers: corsHeaders })
        }

        const body = await req.json();
        const { email, password, fullName, phone, role } = body;
        console.log("Creating user:", { email, fullName, phone, role });

        const supabaseAdmin = createClient(
            Deno.env.get('SUPABASE_URL') ?? '',
            Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
        )

        const { data: newUser, error: createError } = await supabaseAdmin.auth.admin.createUser({
            email,
            password,
            email_confirm: true,
            user_metadata: { full_name: fullName, phone: phone }
        })

        if (createError) throw createError

        if (newUser.user) {
            const updates: any = { must_change_password: true };
            if (role) updates.role = role;
            if (phone) updates.phone = phone;

            await supabaseAdmin
                .from('profiles')
                .update(updates)
                .eq('id', newUser.user.id)
        }

        return new Response(JSON.stringify(newUser), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        })

    } catch (error) {
        console.error("Admin Create User Error:", error);
        return new Response(JSON.stringify({ error: error.message, details: error }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 400,
        })
    }
})
