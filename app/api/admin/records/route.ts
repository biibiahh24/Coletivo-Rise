import { env } from "cloudflare:workers";
import { z } from "zod";
import { getAdminFromHeaders, sameOrigin } from "@/lib/admin-auth";

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
  const admin = getAdminFromHeaders(request.headers);
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

  const runtime = env as unknown as { DB?: D1Database };
  if (!runtime.DB) return reply({ error: "Banco indisponível." }, 503);
  const now = Math.floor(Date.now() / 1000);
  const data = parsed.data;
  const statement = data.kind === "registration"
    ? runtime.DB.prepare("UPDATE camp_registrations SET registration_status = ?, payment_status = ?, updated_at = ? WHERE id = ?")
    : runtime.DB.prepare("UPDATE shirt_orders SET order_status = ?, payment_status = ?, updated_at = ? WHERE id = ?");

  const result = await statement.bind(data.status, data.paymentStatus, now, data.id).run();
  if (!result.meta.changes) return reply({ error: "Registro não encontrado." }, 404);
  await runtime.DB.prepare("INSERT INTO admin_audit_logs (actor_email, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, ?, ?, ?)")
    .bind(admin.email, "status_update", data.kind, data.id, JSON.stringify({ status: data.status, paymentStatus: data.paymentStatus }), now).run();
  return reply({ ok: true });
}
