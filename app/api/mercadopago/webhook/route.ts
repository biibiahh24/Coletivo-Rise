import { isSupabaseAdminConfigured, createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) return Response.json({ error: "Not configured" }, { status: 503 });
  const url = new URL(request.url);
  let body: { type?: string; data?: { id?: string }; action?: string } = {};
  try { body = await request.json(); } catch { /* Mercado Pago also sends the payment id in the query string. */ }
  const paymentId = body.data?.id ?? url.searchParams.get("data.id");
  if (!paymentId || (body.type && body.type !== "payment")) return Response.json({ received: true });
  const paymentResponse = await fetch(`https://api.mercadopago.com/v1/payments/${encodeURIComponent(paymentId)}`, { headers: { Authorization: `Bearer ${token}` }, signal: AbortSignal.timeout(10_000) });
  if (!paymentResponse.ok) return Response.json({ error: "Payment lookup failed" }, { status: 502 });
  const payment = await paymentResponse.json() as { status?: string; external_reference?: string };
  if (payment.status === "approved" && payment.external_reference && isSupabaseAdminConfigured()) {
    const db = createSupabaseAdminClient();
    const now = Math.floor(Date.now() / 1000);
    await Promise.all([
      db.from("camp_registrations").update({ payment_status: "paid", updated_at: now }).eq("protocol", payment.external_reference),
      db.from("shirt_orders").update({ payment_status: "paid", updated_at: now }).eq("protocol", payment.external_reference),
    ]);
  }
  return Response.json({ received: true });
}
