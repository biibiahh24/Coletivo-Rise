import { z } from "zod";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getCarnetByToken } from "@/lib/carnet";

export const dynamic = "force-dynamic";
const schema = z.object({ token: z.string().min(40).max(120), amountCents: z.coerce.number().int().positive() });

export async function POST(request: Request) {
  const mpToken = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!mpToken) return Response.json({ error: "O checkout do Mercado Pago ainda não foi configurado." }, { status: 503 });
  let raw: unknown;
  try { raw = await request.json(); } catch { return Response.json({ error: "Dados inválidos." }, { status: 400 }); }
  const parsed = schema.safeParse(raw);
  if (!parsed.success) return Response.json({ error: "Informe um valor válido." }, { status: 400 });
  const { data: plan, error } = await getCarnetByToken(parsed.data.token);
  if (error || !plan) return Response.json({ error: "Carnê não encontrado." }, { status: 404 });
  if (new Date().toISOString().slice(0, 10) > plan.due_date) return Response.json({ error: "O prazo para quitar este carnê terminou." }, { status: 410 });
  const remaining = Math.max(0, plan.total_amount_cents - plan.paid_amount_cents);
  if (!remaining) return Response.json({ error: "Este carnê já está quitado." }, { status: 409 });
  const minimum = remaining < 5000 ? remaining : 5000;
  if (parsed.data.amountCents < minimum || parsed.data.amountCents > remaining) {
    return Response.json({ error: remaining < 5000 ? `O saldo restante é de R$ ${(remaining / 100).toFixed(2).replace(".", ",")}.` : "O pagamento mínimo é de R$ 50,00 e não pode ultrapassar o saldo restante." }, { status: 400 });
  }
  const now = Math.floor(Date.now() / 1000);
  const db = createSupabaseAdminClient();
  const paymentId = crypto.randomUUID();
  const externalReference = `CARNET:${paymentId}`;
  const { error: insertError } = await db.from("carnet_payments").insert({ id: paymentId, carnet_id: plan.id, external_reference: externalReference, amount_cents: parsed.data.amountCents, created_at: now, updated_at: now });
  if (insertError) return Response.json({ error: "Não foi possível preparar este pagamento." }, { status: 500 });
  const origin = new URL(request.url).origin;
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${mpToken}`, "Content-Type": "application/json" },
    body: JSON.stringify({ items: [{ id: "carnet-rise-2027", title: "Pagamento do carnê Rise", description: `Parcela do carnê até ${plan.due_date}`, quantity: 1, unit_price: parsed.data.amountCents / 100, currency_id: "BRL" }], external_reference: externalReference, notification_url: `${origin}/api/mercadopago/webhook`, back_urls: { success: `${origin}/carnes?token=${encodeURIComponent(parsed.data.token)}&status=sucesso`, failure: `${origin}/carnes?token=${encodeURIComponent(parsed.data.token)}&status=cancelado`, pending: `${origin}/carnes?token=${encodeURIComponent(parsed.data.token)}&status=pendente` }, auto_return: "approved" }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json().catch(() => ({})) as { init_point?: string; sandbox_init_point?: string; message?: string };
  const checkoutUrl = process.env.MERCADOPAGO_ENV === "sandbox" ? result.sandbox_init_point : result.init_point;
  if (!response.ok || !checkoutUrl) {
    await db.from("carnet_payments").delete().eq("id", paymentId);
    return Response.json({ error: result.message ?? "Não foi possível abrir o pagamento." }, { status: 502 });
  }
  return Response.json({ checkoutUrl });
}
