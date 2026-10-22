import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { SupabaseClient } from "@supabase/supabase-js";
import { getSupabasePublicConfig } from "@/lib/supabase/config";

function publicConfig() {
  return getSupabasePublicConfig();
}

/** Server client that reads/writes the Supabase Auth session cookie. */
export async function createSupabaseServerClient(): Promise<SupabaseClient> {
  const { url, key } = publicConfig();
  const cookieStore = await cookies();
  return createServerClient(url, key, {
    cookies: {
      getAll() { return cookieStore.getAll(); },
      setAll(values) {
        try { values.forEach(({ name, value, options }) => cookieStore.set(name, value, options)); } catch {
          // Server Components cannot always mutate cookies; middleware/route handlers do.
        }
      },
    },
  });
}

export function isSupabaseConfigured() {
  const { url, key } = getSupabasePublicConfig();
  return Boolean(url && key);
}
