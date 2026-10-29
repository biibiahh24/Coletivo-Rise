import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET() {
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
  let registrationCount = 0;
  if (isSupabaseAdminConfigured()) {
    try {
      const { count } = await createSupabaseAdminClient()
        .from("camp_registrations")
        .select("protocol", { count: "exact", head: true });
      registrationCount = count ?? 0;
    } catch {
      // Keep the public form available if the optional lot counter is unavailable.
    }
  }
  const currentLote = registrationCount < 10
    ? "10 primeiras vagas — R$ 400,00"
    : "Próximas vagas — R$ 450,00";
  return Response.json(
    { configured: Boolean(siteKey), siteKey, registrationCount, currentLote },
    { headers: { "Cache-Control": "no-store" } },
  );
}
