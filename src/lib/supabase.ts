import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

export function isSupabaseConfigured() {
  return Boolean(supabaseUrl && anonKey);
}

export function isServiceSupabaseConfigured() {
  return Boolean(supabaseUrl && serviceRoleKey);
}

export function getSupabaseBrowserClient() {
  if (!supabaseUrl || !anonKey) throw new Error("Supabase browser env vars are not configured.");
  return createClient(supabaseUrl, anonKey);
}

export function getSupabaseServerClient() {
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Supabase service env vars are not configured.");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { persistSession: false } });
}
