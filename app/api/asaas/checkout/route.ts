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

const jsonHeaders = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });

function asaasBaseUrl() {
  return process.env.ASAAS_ENV === "sandbox" ? "https://api-sandbox.asaas.com" : "https://api.asaas.com";
}

export async function POST(request: Request) {
  const apiKey = process.env.ASAAS_API_KEY?.trim();
  if (!apiKey) return reply({ error: "O checkout online ainda não foi configurado pela equipe." }, 503);
  if (request.headers.get("origin") && request.headers.get("origin") !== new URL(request.url).origin) return reply({ error: "Origem não autorizada." }, 403);

  let payload: unknown;
  try { payload = await request.json(); } catch { return reply({ error: "Dados do checkout inválidos." }, 400); }
  const parsed = requestSchema.safeParse(payload);
  if (!parsed.success) return reply({ error: "Selecione uma opção válida antes de continuar." }, 400);
  const data = parsed.data;

  const items = data.kind === "registration"
    ? [
        { name: `Inscrição Acampamento Rise — ${data.lote === "primeiras" ? "1º lote" : "próximas vagas"}`, description: "Inscrição para o Acampamento Rise 2027", quantity: 1, value: data.lote === "primeiras" ? 400 : 450 },
        ...(data.presskit === "Sim" ? [{ name: "Presskit Rise", description: "Presskit opcional do Acampamento Rise", quantity: 1, value: 60 }] : []),
      ]
    : [{ name: data.product === "presskit" ? "Presskit Rise" : "Camiseta Rise — Edição 01", description: data.product === "presskit" ? "Caixa completa com camiseta e acessórios" : "Camiseta oficial da coleção Rise", quantity: data.quantity ?? 1, value: data.product === "presskit" ? 119.9 : 149 }];

  const origin = new URL(request.url).origin;
  const billingType = data.pagamento === "PIX" ? "PIX" : "CREDIT_CARD";
  const asaasResponse = await fetch(`${asaasBaseUrl()}/v3/checkouts`, {
    method: "POST",
    headers: { access_token: apiKey, "Content-Type": "application/json", accept: "application/json" },
    body: JSON.stringify({
      billingTypes: [billingType],
      chargeTypes: ["DETACHED"],
      minutesToExpire: 60,
      externalReference: data.protocol,
      callback: {
        successUrl: `${origin}/pagamento/sucesso?protocol=${encodeURIComponent(data.protocol)}`,
        cancelUrl: `${origin}/pagamento/cancelado?protocol=${encodeURIComponent(data.protocol)}`,
        expiredUrl: `${origin}/pagamento/expirado?protocol=${encodeURIComponent(data.protocol)}`,
      },
      items,
    }),
    signal: AbortSignal.timeout(10_000),
  });
  const result = await asaasResponse.json().catch(() => ({})) as { id?: string; errors?: Array<{ description?: string }> };
  if (!asaasResponse.ok || !result.id) {
    console.error("Asaas checkout creation failed", asaasResponse.status, result);
    return reply({ error: result.errors?.[0]?.description ?? "Não foi possível abrir o checkout do Asaas agora." }, 502);
  }
  return reply({ checkoutUrl: `https://asaas.com/checkoutSession/show?id=${encodeURIComponent(result.id)}` });
}
