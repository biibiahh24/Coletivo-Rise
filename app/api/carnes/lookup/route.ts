import { createCarnetLookupToken, normalizePhone } from "@/lib/carnet";
import { consumeRequestRateLimit } from "@/lib/request-rate-limit";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  try {
    const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim()
      || request.headers.get("x-real-ip")?.trim()
      || "unknown";
    const rateLimit = consumeRequestRateLimit(`carnet-lookup:${ip}`, 8, 15 * 60 * 1000);
    if (!rateLimit.allowed) {
      return new Response(JSON.stringify({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }), {
        status: 429,
        headers: { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8", "Retry-After": String(rateLimit.retryAfterSeconds) },
      });
    }
    let body: { phone?: string };
    try { body = await request.json(); } catch { return Response.json({ error: "Informe um telefone válido." }, { status: 400, headers: { "Cache-Control": "no-store" } }); }
    const phone = normalizePhone(body.phone ?? "");
    if (phone.length < 10) return Response.json({ error: "Informe o número usado na inscrição." }, { status: 400, headers: { "Cache-Control": "no-store" } });
    const db = createSupabaseAdminClient();
    const { data, error } = await db.from("carnet_plans").select("id, full_name, phone, total_amount_cents, paid_amount_cents, due_date, status").eq("phone_normalized", phone).order("created_at", { ascending: false }).limit(1).maybeSingle();
    if (error || !data) return Response.json({ error: "Não encontramos um carnê para este número." }, { status: 404, headers: { "Cache-Control": "no-store" } });
    const token = await createCarnetLookupToken(data.id, data.phone);
    return Response.json({ token }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("carnet_lookup_failed", error instanceof Error ? error.message : "unknown_error");
    return Response.json({ error: "Não foi possível consultar o carnê agora. Verifique a configuração do servidor." }, { status: 500 });
  }
}
