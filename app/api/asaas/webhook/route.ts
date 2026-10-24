import { isSupabaseAdminConfigured, createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const expectedToken = process.env.ASAAS_WEBHOOK_TOKEN?.trim();
  if (!expectedToken || request.headers.get("asaas-access-token") !== expectedToken) return Response.json({ error: "Unauthorized" }, { status: 401 });
  let body: { event?: string; checkout?: { externalReference?: string } };
  try { body = await request.json(); } catch { return Response.json({ error: "Invalid JSON" }, { status: 400 }); }
  const protocol = body.checkout?.externalReference;
  if (!protocol) return Response.json({ received: true });
  const paymentStatus = body.event === "CHECKOUT_PAID" ? "paid" : undefined;
  if (paymentStatus && isSupabaseAdminConfigured()) {
    const db = createSupabaseAdminClient();
    await Promise.all([
      db.from("camp_registrations").update({ payment_status: paymentStatus, updated_at: Math.floor(Date.now() / 1000) }).eq("protocol", protocol),
      db.from("shirt_orders").update({ payment_status: paymentStatus, updated_at: Math.floor(Date.now() / 1000) }).eq("protocol", protocol),
    ]);
  }
  return Response.json({ received: true });
}
