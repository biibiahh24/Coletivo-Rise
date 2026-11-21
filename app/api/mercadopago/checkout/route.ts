import { z } from "zod";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { getRegistrationPrice } from "@/lib/registration-price";

export const dynamic = "force-dynamic";

const requestSchema = z.object({
  kind: z.enum(["registration", "shirt"]),
  protocol: z.string().min(8).max(80),
  pagamento: z.enum(["PIX", "Cartão"]),
  lote: z.enum(["primeiras", "proximas"]).optional(),
  inscricaoComCamiseta: z.enum(["Sim", "Não"]).optional(),
  presskit: z.enum(["Sim", "Não"]).optional(),
  product: z.enum(["shirt", "presskit"]).optional(),
  edition: z.enum(["Camiseta Rise — Levanta-te Off-white", "Camiseta Rise — Levanta-te Roxa", "Camiseta Rise — Geração que se levanta", "Presskit Rise"]).optional(),
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
  if (data.kind === "shirt") return reply({ error: "Pedidos de camisetas são confirmados pelo WhatsApp." }, 409);
  if (!isSupabaseAdminConfigured()) return reply({ error: "Inscrições temporariamente indisponíveis." }, 503);
  let registrationPrice: number;
  try { registrationPrice = await getRegistrationPrice(data.protocol); }
  catch { return reply({ error: "Não foi possível consultar o valor da inscrição." }, 503); }
  const registrationLabel = registrationPrice === 550 ? "inscrição com presskit" : registrationPrice === 500 ? "inscrição com camiseta" : registrationPrice === 400 ? "10 primeiras inscrições" : "demais inscrições";
  const items = data.kind === "registration"
    ? [{ id: "acampamento-rise-2027", title: `Inscrição Acampamento Rise — ${registrationLabel}`, description: "Inscrição para o Acampamento Rise 2027", quantity: 1, unit_price: registrationPrice, currency_id: "BRL" }]
    : [{ id: data.product === "presskit" ? "presskit-rise" : "camiseta-rise-geracao", title: data.product === "presskit" ? "Presskit Rise" : (data.edition ?? "Camiseta Rise — Geração que se levanta"), description: data.product === "presskit" ? "Caixa completa com camiseta e acessórios" : "Camiseta oficial da coleção Rise", quantity: data.quantity ?? 1, unit_price: data.product === "presskit" ? 100 : 50, currency_id: "BRL" }];
  const origin = new URL(request.url).origin;
  const paymentMethods = data.pagamento === "PIX"
    ? { excluded_payment_types: [{ id: "credit_card" }, { id: "debit_card" }, { id: "ticket" }, { id: "atm" }] }
    : { excluded_payment_types: [{ id: "bank_transfer" }, { id: "ticket" }, { id: "atm" }] };
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
