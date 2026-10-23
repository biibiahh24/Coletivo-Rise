import { z } from "zod";
import { getAdminAuthConfigurationError, getAdminForRequest, sameOrigin } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

const updateSchema = z.discriminatedUnion("kind", [
  z.object({
    kind: z.literal("registration"),
    id: z.number().int().positive(),
    status: z.enum(["pending", "confirmed", "waitlist", "cancelled"]),
    paymentStatus: z.enum(["pending", "partial", "paid", "refunded"]),
  }),
  z.object({
    kind: z.literal("shirt"),
    id: z.number().int().positive(),
    status: z.enum(["pending", "separated", "delivered", "cancelled"]),
    paymentStatus: z.enum(["pending", "partial", "paid", "refunded"]),
  }),
]);

const reply = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function PATCH(request: Request) {
  if (getAdminAuthConfigurationError()) return reply({ error: "Autenticação administrativa não configurada." }, 503);
  const admin = await getAdminForRequest(request.headers);
  if (!admin) return reply({ error: "Acesso não autorizado." }, 403);
  if (!sameOrigin(request)) return reply({ error: "Origem não autorizada." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Formato inválido." }, 415);

  let raw: unknown;
  try {
    raw = await request.json();
  } catch {
    return reply({ error: "Dados inválidos." }, 400);
  }
  const parsed = updateSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: "Atualização inválida." }, 400);

  const now = Math.floor(Date.now() / 1000);
  const data = parsed.data;
  const db = createSupabaseAdminClient();
  const table = data.kind === "registration" ? "camp_registrations" : "shirt_orders";
  const statusField = data.kind === "registration" ? "registration_status" : "order_status";
  const { data: updated, error } = await db.from(table)
    .update({ [statusField]: data.status, payment_status: data.paymentStatus, updated_at: now })
    .eq("id", data.id)
    .select("id")
    .maybeSingle();
  if (error) return reply({ error: "Não foi possível atualizar o registro." }, 500);
  if (!updated) return reply({ error: "Registro não encontrado." }, 404);
  await db.from("admin_audit_logs").insert({ actor_email: admin.email, action: "status_update", entity_type: data.kind, entity_id: data.id, details: { status: data.status, paymentStatus: data.paymentStatus }, created_at: now });
  return reply({ ok: true });
}

export async function DELETE(request: Request) {
  if (getAdminAuthConfigurationError()) return reply({ error: "Autenticação administrativa não configurada." }, 503);
  const admin = await getAdminForRequest(request.headers);
  if (!admin) return reply({ error: "Acesso não autorizado." }, 403);
  if (!sameOrigin(request)) return reply({ error: "Origem não autorizada." }, 403);
  let raw: unknown;
  try { raw = await request.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
  const parsed = z.object({ kind: z.enum(["registration", "shirt"]), id: z.number().int().positive() }).safeParse(raw);
  if (!parsed.success) return reply({ error: "Registro inválido." }, 400);
  const db = createSupabaseAdminClient();
  const table = parsed.data.kind === "registration" ? "camp_registrations" : "shirt_orders";
  const lookup = await db.from(table).select("id, receipt_key").eq("id", parsed.data.id).maybeSingle();
  if (lookup.error) return reply({ error: "Não foi possível localizar o registro." }, 500);
  if (!lookup.data) return reply({ error: "Registro não encontrado." }, 404);
  const { error } = await db.from(table).delete().eq("id", parsed.data.id);
  if (error) return reply({ error: "Não foi possível apagar o registro." }, 500);
  if (parsed.data.kind === "registration" && lookup.data.receipt_key) await db.storage.from("receipts").remove([lookup.data.receipt_key]);
  await db.from("admin_audit_logs").insert({ actor_email: admin.email, action: "record_delete", entity_type: parsed.data.kind, entity_id: parsed.data.id, details: {}, created_at: Math.floor(Date.now() / 1000) });
  return reply({ ok: true });
}

