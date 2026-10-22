import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

let client: SupabaseClient | undefined;

/** Server-only client. Never import this module into a Client Component. */
export function createSupabaseAdminClient() {
  const { url } = getSupabasePublicConfig();
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY?.trim();
  if (!url || !key) throw new Error("Supabase server não configurado: defina NEXT_PUBLIC_SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY.");
  client ??= createClient(url, key, { auth: { autoRefreshToken: false, persistSession: false } });
  return client;
}

export function isSupabaseAdminConfigured() {
  return Boolean(getSupabasePublicConfig().url && process.env.SUPABASE_SERVICE_ROLE_KEY?.trim());
}
