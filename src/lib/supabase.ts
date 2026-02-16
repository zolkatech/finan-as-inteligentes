
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
    console.error("Missing Supabase environment variables! Check your .env file.", { supabaseUrl, supabaseAnonKey });
}

// Fallback to empty strings to prevent crash, client will fail later if invalid
export const supabase = createClient(supabaseUrl || "", supabaseAnonKey || "");
