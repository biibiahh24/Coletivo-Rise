import { z } from "zod";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  kind: z.enum(["registration", "shirt"]),
  protocol: z.string().min(8).max(80),
  pagamento: z.enum(["PIX", "Cartão"]),
  lote: z.enum(["primeiras", "proximas"]).optional(),
  presskit: z.enum(["Sim", "Não"]).optional(),
  product: z.enum(["shirt", "presskit"]).optional(),
  quantity: z.coerce.number().int().min(1).max(5).optional(),
});

const headers = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers });

export async function POST(request: Request) {
  const token = process.env.MERCADOPAGO_ACCESS_TOKEN?.trim();
  if (!token) return reply({ error: "O checkout do Mercado Pago ainda não foi configurado." }, 503);
  let raw: unknown;
  try { raw = await request.json(); } catch { return reply({ error: "Dados do checkout inválidos." }, 400); }
  const parsed = requestSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: "Selecione uma opção válida antes de continuar." }, 400);
  const data = parsed.data;
  const items = data.kind === "registration"
    ? [{ id: "acampamento-rise-2027", title: `Inscrição Acampamento Rise — ${data.lote === "primeiras" ? "1º lote" : "próximas vagas"}`, description: "Inscrição para o Acampamento Rise 2027", quantity: 1, unit_price: data.lote === "primeiras" ? 400 : 450, currency_id: "BRL" }, ...(data.presskit === "Sim" ? [{ id: "presskit-rise", title: "Presskit Rise", description: "Presskit opcional do Acampamento Rise", quantity: 1, unit_price: 60, currency_id: "BRL" }] : [])]
    : [{ id: data.product === "presskit" ? "presskit-rise" : "camiseta-rise-edicao-01", title: data.product === "presskit" ? "Presskit Rise" : "Camiseta Rise — Edição 01", description: data.product === "presskit" ? "Caixa completa com camiseta e acessórios" : "Camiseta oficial da coleção Rise", quantity: data.quantity ?? 1, unit_price: data.product === "presskit" ? 119.9 : 79.9, currency_id: "BRL" }];
  const origin = new URL(request.url).origin;
  const paymentMethods = data.pagamento === "PIX"
    ? { default_payment_method_id: "pix", excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }, { id: "atm" }] }
    : { default_payment_method_id: "credit_card", excluded_payment_types: [{ id: "bank_transfer" }, { id: "ticket" }, { id: "atm" }] };
  const response = await fetch("https://api.mercadopago.com/checkout/preferences", {
    method: "POST",
    headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    body: JSON.stringify({ items, payment_methods: paymentMethods, external_reference: data.protocol, notification_url: `${origin}/api/mercadopago/webhook`, back_urls: { success: `${origin}/pagamento/sucesso?protocol=${encodeURIComponent(data.protocol)}`, failure: `${origin}/pagamento/cancelado?protocol=${encodeURIComponent(data.protocol)}`, pending: `${origin}/pagamento/pendente?protocol=${encodeURIComponent(data.protocol)}` }, auto_return: "approved" }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await response.json().catch(() => ({})) as { init_point?: string; sandbox_init_point?: string; message?: string };
  const checkoutUrl = process.env.MERCADOPAGO_ENV === "sandbox" ? result.sandbox_init_point : result.init_point;
  if (!response.ok || !checkoutUrl) {
    console.error("Mercado Pago preference creation failed", response.status, result);
    return reply({ error: result.message ?? "Não foi possível abrir o checkout do Mercado Pago agora." }, 502);
  }
  return reply({ checkoutUrl });
}
