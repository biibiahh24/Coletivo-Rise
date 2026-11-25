import { z } from "zod";
import { getAdminAuthConfigurationError, getAdminForRequest, sameOrigin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { getRegistrationPrice } from "@/lib/registration-price";

export const dynamic = "force-dynamic";

const paymentSchema = z.object({
  registrationId: z.number().int().positive(),
  amountCents: z.number().int().positive().max(10_000_000),
  paymentMethod: z.enum(["Pix", "Mercado Pago", "Dinheiro", "Transferência", "Cartão", "Outro"]),
  notes: z.string().trim().max(300).optional().default(""),
});

const reply = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (getAdminAuthConfigurationError()) return reply({ error: "Autenticação administrativa não configurada." }, 503);
  const admin = await getAdminForRequest(request.headers);
  if (!admin) return reply({ error: "Acesso não autorizado." }, 403);
  if (!sameOrigin(request)) return reply({ error: "Origem não autorizada." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Formato inválido." }, 415);
  let raw: unknown;
  try { raw = await request.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
  const parsed = paymentSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: "Informe um valor e método de pagamento válidos." }, 400);

  const db = createSupabaseAdminClient();
  const registration = await db.from("camp_registrations").select("id, protocol").eq("id", parsed.data.registrationId).maybeSingle();
  if (registration.error) return reply({ error: "Não foi possível localizar a inscrição." }, 500);
  if (!registration.data) return reply({ error: "Inscrição não encontrada." }, 404);
  const existing = await db.from("admin_audit_logs").select("details").eq("entity_type", "registration_payment").eq("entity_id", parsed.data.registrationId);
  if (existing.error) return reply({ error: "Não foi possível consultar os pagamentos anteriores." }, 500);
  const paidBefore = (existing.data ?? []).reduce((total, row) => {
    const details = row.details as { amountCents?: unknown } | null;
    return total + (typeof details?.amountCents === "number" ? details.amountCents : 0);
  }, 0);
  let totalCents: number;
  try { totalCents = (await getRegistrationPrice(registration.data.protocol)) * 100; }
  catch { return reply({ error: "Não foi possível calcular o valor da inscrição." }, 503); }
  const paidAfter = paidBefore + parsed.data.amountCents;
  const paymentStatus = paidAfter >= totalCents ? "paid" : "partial";
  const now = Math.floor(Date.now() / 1000);
  const audit = await db.from("admin_audit_logs").insert({
    actor_email: admin.email, action: "payment_recorded", entity_type: "registration_payment", entity_id: parsed.data.registrationId,
    details: { registrationId: parsed.data.registrationId, protocol: registration.data.protocol, amountCents: parsed.data.amountCents, paymentMethod: parsed.data.paymentMethod, notes: parsed.data.notes }, created_at: now,
  });
  if (audit.error) return reply({ error: "Não foi possível registrar o pagamento." }, 500);
  const updated = await db.from("camp_registrations").update({ payment_status: paymentStatus, updated_at: now }).eq("id", parsed.data.registrationId).select("id").maybeSingle();
  if (updated.error || !updated.data) return reply({ error: "Pagamento registrado, mas não foi possível atualizar o status." }, 500);
  return reply({ ok: true, paidAmountCents: paidAfter, totalCents, paymentStatus });
}
