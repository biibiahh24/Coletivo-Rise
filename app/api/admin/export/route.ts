import { getAdminAuthConfigurationError, getAdminForRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export const dynamic = "force-dynamic";

function csvCell(value: unknown) {
  let text = value == null ? "" : String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

export async function GET(request: Request) {
  if (getAdminAuthConfigurationError()) return Response.json({ error: "Autenticação administrativa não configurada." }, { status: 503, headers: { "Cache-Control": "no-store" } });
  const admin = await getAdminForRequest(request.headers);
  if (!admin) return Response.json({ error: "Acesso não autorizado." }, { status: 403, headers: { "Cache-Control": "no-store" } });
  const db = createSupabaseAdminClient();

  const kind = new URL(request.url).searchParams.get("kind") === "shirt" ? "shirt" : "registration";
  let headers: string[];
  let rows: Record<string, unknown>[];
  if (kind === "registration") {
    headers = ["Protocolo", "Nome", "Idade", "Responsável", "Telefone", "Igreja", "Cidade/Bairro", "Alergias", "Medicação", "Restrição alimentar", "Já participou", "Camiseta", "Pagamento", "Status do pagamento", "Status da inscrição", "Comprovante", "Observações", "Consentimento em", "Versão da política", "Criado em"];
    const result = await db.from("camp_registrations").select("protocol, full_name, age, guardian_name, phone, church, location, allergies, medication, dietary_restrictions, attended_before, shirt_size, payment_method, payment_status, registration_status, receipt_key, notes, consent_at, privacy_version, created_at").order("created_at", { ascending: false }).limit(5000);
    if (result.error) return Response.json({ error: "Não foi possível exportar os dados." }, { status: 500 });
    rows = (result.data as Record<string, unknown>[]).map(({ receipt_key, ...row }) => ({ ...row, has_receipt: receipt_key ? "Sim" : "Não" }));
  } else {
    headers = ["Protocolo", "Nome", "Telefone", "Modelo", "Tamanho", "Quantidade", "Pagamento", "Status do pagamento", "Status do pedido", "Consentimento em", "Versão da política", "Criado em"];
    const result = await db.from("shirt_orders").select("protocol, full_name, phone, edition, size, quantity, payment_method, payment_status, order_status, consent_at, privacy_version, created_at").order("created_at", { ascending: false }).limit(5000);
    if (result.error) return Response.json({ error: "Não foi possível exportar os dados." }, { status: 500 });
    rows = result.data as Record<string, unknown>[];
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
  await db.from("admin_audit_logs").insert({ actor_email: admin.email, action: "csv_export", entity_type: kind, entity_id: null, details: { rows: rows.length }, created_at: now });
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
