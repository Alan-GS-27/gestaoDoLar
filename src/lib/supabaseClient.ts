import { createClient, type SupabaseClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

let supabase: SupabaseClient | null = null;

if (supabaseUrl && supabaseAnonKey) {
  supabase = createClient(supabaseUrl, supabaseAnonKey);
} else if (typeof window !== "undefined") {
  console.warn("Supabase env vars are missing.");
}

export function getSupabaseClient() {
  if (!supabase) {
    throw new Error("Supabase client not configured.");
  }
  return supabase;
}
