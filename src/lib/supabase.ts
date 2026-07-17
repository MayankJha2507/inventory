import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

/**
 * Null when Supabase credentials are not configured — the app then runs on
 * the local adapter (see src/data). Set VITE_SUPABASE_URL and
 * VITE_SUPABASE_ANON_KEY in .env to switch to Supabase.
 */
export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;

export const isSupabaseEnabled = supabase !== null;
