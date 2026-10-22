const projectUrl = "https://cxqavosohnqweqkwfvvp.supabase.co";
const publishableKey = "sb_publishable_nOhSP1CC9enpaZD91JQ4Yg_vQgtuMvo";

/** Public Supabase connection details. These values identify the project but do
 * not grant privileged access; server secrets remain in Vercel only. */
export function getSupabasePublicConfig() {
  return {
    url: process.env.NEXT_PUBLIC_SUPABASE_URL?.trim() || projectUrl,
    key: process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY?.trim()
      || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY?.trim()
      || publishableKey,
  };
}

