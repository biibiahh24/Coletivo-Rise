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
  const payment = await paymentResponse.json() as { id?: string; status?: string; external_reference?: string };
  if (payment.status === "approved" && payment.external_reference?.startsWith("CARNET:") && isSupabaseAdminConfigured()) {
    const db = createSupabaseAdminClient();
    const now = Math.floor(Date.now() / 1000);
    const { data: carnetPayment } = await db.from("carnet_payments").select("id, carnet_id, amount_cents, status").eq("external_reference", payment.external_reference).maybeSingle();
    if (carnetPayment && carnetPayment.status !== "approved") {
      await db.from("carnet_payments").update({ status: "approved", mercadopago_payment_id: payment.id ?? paymentId, approved_at: now, updated_at: now }).eq("id", carnetPayment.id).eq("status", "pending");
      const { data: approved } = await db.from("carnet_payments").select("amount_cents").eq("carnet_id", carnetPayment.carnet_id).eq("status", "approved");
      const { data: plan } = await db.from("carnet_plans").select("total_amount_cents").eq("id", carnetPayment.carnet_id).maybeSingle();
      const paidAmountCents = Math.min(plan?.total_amount_cents ?? 0, (approved ?? []).reduce((sum, row) => sum + row.amount_cents, 0));
      await db.from("carnet_plans").update({ paid_amount_cents: paidAmountCents, status: paidAmountCents >= (plan?.total_amount_cents ?? 0) ? "paid" : "pending", updated_at: now }).eq("id", carnetPayment.carnet_id);
    }
  } else if (payment.status === "approved" && payment.external_reference && isSupabaseAdminConfigured()) {
    const db = createSupabaseAdminClient();
    const now = Math.floor(Date.now() / 1000);
    await Promise.all([
      db.from("camp_registrations").update({ payment_status: "paid", updated_at: now }).eq("protocol", payment.external_reference),
      db.from("shirt_orders").update({ payment_status: "paid", updated_at: now }).eq("protocol", payment.external_reference),
    ]);
  }
  return Response.json({ received: true });
}
