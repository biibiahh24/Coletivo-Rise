import { env } from "@/lib/runtime-env";
import { getAdminAuthConfigurationError, getAdminForRequest, getAdminFromHeaders } from "@/lib/admin-auth";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (getAdminAuthConfigurationError()) return Response.json({ error: "Autenticação administrativa não configurada." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const admin = await getAdminForRequest(request.headers) ?? getAdminFromHeaders(request.headers);
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const runtime = env as unknown as { DB?: D1Database };
  if (!runtime.DB) return Response.json({ error: "Banco indisponível." }, { status: 503 });

  const kind = new URL(request.url).searchParams.get("kind") === "shirt" ? "shirt" : "registration";
  let headers: string[];
  let rows: Record<string, unknown>[];
  if (kind === "registration") {
    headers = ["Protocolo", "Nome", "Idade", "Responsável", "Telefone", "Igreja", "Cidade/Bairro", "Alergias", "Medicação", "Restrição alimentar", "Já participou", "Camiseta", "Pagamento", "Status do pagamento", "Status da inscrição", "Comprovante", "Observações", "Consentimento em", "Versão da política", "Criado em"];
    const result = await runtime.DB.prepare(`SELECT protocol, full_name, age, guardian_name, phone, church, location,
      allergies, medication, dietary_restrictions, attended_before, shirt_size, payment_method, payment_status,
      registration_status, CASE WHEN receipt_key IS NULL THEN 'Não' ELSE 'Sim' END AS has_receipt, notes,
      consent_at, privacy_version, created_at FROM camp_registrations ORDER BY created_at DESC LIMIT 5000`).all<Record<string, unknown>>();
    rows = result.results;
  } else {
    headers = ["Protocolo", "Nome", "Telefone", "Modelo", "Tamanho", "Quantidade", "Pagamento", "Status do pagamento", "Status do pedido", "Consentimento em", "Versão da política", "Criado em"];
    const result = await runtime.DB.prepare(`SELECT protocol, full_name, phone, edition, size, quantity, payment_method,
      payment_status, order_status, consent_at, privacy_version, created_at FROM shirt_orders ORDER BY created_at DESC LIMIT 5000`).all<Record<string, unknown>>();
    rows = result.results;
  }

  const keys = kind === "registration"
    ? ["protocol", "full_name", "age", "guardian_name", "phone", "church", "location", "allergies", "medication", "dietary_restrictions", "attended_before", "shirt_size", "payment_method", "payment_status", "registration_status", "has_receipt", "notes", "consent_at", "privacy_version", "created_at"]
    : ["protocol", "full_name", "phone", "edition", "size", "quantity", "payment_method", "payment_status", "order_status", "consent_at", "privacy_version", "created_at"];
  const dateKeys = new Set(["consent_at", "created_at"]);
  const lines = [headers.map(csvCell).join(";")];
  for (const row of rows) {
    lines.push(keys.map((key) => csvCell(dateKeys.has(key) && row[key] ? new Date(Number(row[key]) * 1000).toISOString() : row[key])).join(";"));
  }

  const now = Math.floor(Date.now() / 1000);
  await runtime.DB.prepare("INSERT INTO admin_audit_logs (actor_email, action, entity_type, entity_id, details, created_at) VALUES (?, ?, ?, NULL, ?, ?)")
    .bind(admin.email, "csv_export", kind, JSON.stringify({ rows: rows.length }), now).run();
  const filename = `${kind === "registration" ? "inscricoes-acampa-2027" : "pedidos-camisetas"}-${new Date().toISOString().slice(0, 10)}.csv`;
  return new Response(`\uFEFF${lines.join("\r\n")}`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
      "X-Content-Type-Options": "nosniff",
    },
  });
}
