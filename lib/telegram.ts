import type { Submission } from "@/lib/submission-schema";

type TelegramResult = { ok: boolean; error?: string };

function formatMessage(submission: Submission, protocol: string) {
  const product = submission.kind === "registration"
    ? `Inscrição no acampamento\nCamiseta: ${submission.corCamiseta} / tamanho ${submission.camiseta}\nPresskit: ${submission.presskit}`
    : `Pedido de camiseta\nEdição: ${submission.edition}\nTamanho: ${submission.size}\nQuantidade: ${submission.quantity}`;

  return [
    "🔔 Nova inscrição recebida",
    `Protocolo: ${protocol}`,
    `Nome: ${submission.nome}`,
    `Telefone: ${submission.telefone}`,
    product,
    `Pagamento: ${submission.pagamento}`,
  ].join("\n");
}

export async function notifyTelegram(submission: Submission, protocol: string): Promise<TelegramResult> {
  const token = process.env.TELEGRAM_BOT_TOKEN;
  const chatId = process.env.TELEGRAM_CHAT_ID;
  if (!token || !chatId) return { ok: false, error: "not_configured" };

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text: formatMessage(submission, protocol), disable_web_page_preview: true }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!response.ok) return { ok: false, error: `http_${response.status}` };
    const result = await response.json() as { ok?: boolean };
    return result.ok ? { ok: true } : { ok: false, error: "telegram_rejected" };
  } catch {
    return { ok: false, error: "telegram_unavailable" };
  }
}
