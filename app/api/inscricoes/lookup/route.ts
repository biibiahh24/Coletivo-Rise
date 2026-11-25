import { createRegistrationLookupToken, normalizePhone } from "@/lib/carnet";
import { consumeRequestRateLimit } from "@/lib/request-rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || request.headers.get("x-real-ip")?.trim() || "unknown";
    const rateLimit = consumeRequestRateLimit(`registration-lookup:${ip}`, 8, 15 * 60 * 1000);
    if (!rateLimit.allowed) return Response.json({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, { status: 429, headers: { "Cache-Control": "no-store", "Retry-After": String(rateLimit.retryAfterSeconds) } });
    let body: { phone?: string };
    try { body = await request.json(); } catch { return Response.json({ error: "Informe um telefone válido." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
    const phone = normalizePhone(body.phone ?? "");
    if (phone.length < 10) return Response.json({ error: "Informe o número usado na inscrição." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    const db = createSupabaseAdminClient();
    const { data, error } = await db.from("camp_registrations").select("id, phone").eq("phone_normalized", phone).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error || !data) return Response.json({ error: "Não encontramos uma inscrição para este número." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const token = await createRegistrationLookupToken(data.id, data.phone);
    return Response.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("registration_lookup_failed", error instanceof Error ? error.message : "unknown_error");
    return Response.json({ error: "Não foi possível consultar a inscrição agora. Verifique a configuração do servidor." }, { status: 500 });
  }
}
