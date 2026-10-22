import { getAdminAuthConfigurationError, getAdminForRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  if (getAdminAuthConfigurationError()) return Response.json({ error: "Autenticação administrativa não configurada." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const admin = await getAdminForRequest(request.headers);
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const id = Number(new URL(request.url).searchParams.get("id"));
  if (!Number.isInteger(id) || id <= 0) return Response.json({ error: "Identificador inválido." }, { status: 400 });

  const db = createSupabaseAdminClient();
  const { data: record } = await db.from("camp_registrations").select("protocol, receipt_key, receipt_name, receipt_type").eq("id", id).maybeSingle();
  if (!record?.receipt_key) return Response.json({ error: "Comprovante não encontrado." }, { status: 404 });
  const { data: object, error } = await db.storage.from("receipts").download(record.receipt_key);
  if (error || !object) return Response.json({ error: "Comprovante não encontrado." }, { status: 404 });

  await db.from("admin_audit_logs").insert({ actor_email: admin.email, action: "receipt_view", entity_type: "registration", entity_id: id, details: { protocol: record.protocol }, created_at: Math.floor(Date.now() / 1000) });
  const safeName = (record.receipt_name || `${record.protocol}.bin`)
    .normalize("NFKC")
    .replace(/[\u0000-\u001f\u007f"\\/]/g, "_")
    .slice(0, 180) || `${record.protocol}.bin`;
  const asciiName = safeName.replace(/[^\x20-\x7e]/g, "_");
  return new Response(await object.arrayBuffer(), {
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
