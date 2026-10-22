import { env } from "@/lib/runtime-env";
import { getAdminAuthConfigurationError, getAdminForRequest } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (getAdminAuthConfigurationError()) return Response.json({ error: "Autenticação administrativa não configurada." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const admin = await getAdminForRequest(request.headers);
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const runtime = env as unknown as { DB?: D1Database; BUCKET?: R2Bucket };
  if (!runtime.DB || !runtime.BUCKET) return Response.json({ error: "Armazenamento indisponível." }, { status: 503 });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Identificador inválido." }, { status: 400 });

  const record = await runtime.DB.prepare("SELECT protocol, receipt_key, receipt_name, receipt_type FROM camp_registrations WHERE id = ? LIMIT 1")
    .bind(id).first<{ protocol: string; receipt_key: string | null; receipt_name: string | null; receipt_type: string | null }>();
  if (!record?.receipt_key) return Response.json({ error: "Comprovante não encontrado." }, { status: 404 });
  const object = await runtime.BUCKET.get(record.receipt_key);
  if (!object) return Response.json({ error: "Comprovante não encontrado." }, { status: 404 });

  await runtime.DB.prepare("INSERT INTO admin_audit_logs (actor_email, action, entity_type, entity_id, details, created_at) VALUES (?, 'receipt_view', 'registration', ?, ?, ?)")
    .bind(admin.email, id, JSON.stringify({ protocol: record.protocol }), Math.floor(Date.now() / 1000)).run();
  const safeName = (record.receipt_name || `${record.protocol}.bin`)
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f"\\/]/g, "_")
    .slice(0, 180) || `${record.protocol}.bin`;
  const asciiName = safeName.replace(/[^\x20-\x7e]/g, "_");
  return new Response(object.body, {
    headers: {
      "Cache-Control": "private, no-store",
      "Content-Disposition": `attachment; filename="${asciiName}"; filename*=UTF-8''${encodeURIComponent(safeName)}`,
      "Content-Type": "application/octet-stream",
      "Cross-Origin-Resource-Policy": "same-origin",
      "Content-Security-Policy": "default-src 'none'; sandbox",
      "Referrer-Policy": "no-referrer",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
