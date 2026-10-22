import { env } from "@/lib/runtime-env";
import { submissionSchema, type Submission } from "@/lib/submission-schema";
import { isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { persistSupabaseSubmission } from "@/lib/supabase-submissions";

export const dynamic = "force-dynamic";

type RuntimeEnv = {
  DB?: D1Database;
  BUCKET?: R2Bucket;
  GOOGLE_APPS_SCRIPT_URL?: string;
  GOOGLE_APPS_SCRIPT_SECRET?: string;
  TURNSTILE_SECRET_KEY?: string;
  RATE_LIMIT_SALT?: string;
};

const jsonHeaders = { "Cache-Control": "no-store", "Content-Type": "application/json; charset=utf-8" };
const reply = (body: Record<string, unknown>, status = 200) => new Response(JSON.stringify(body), { status, headers: jsonHeaders });

async function hashFingerprint(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(value));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function createProtocol(kind: Submission["kind"]) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  const random = crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase();
  return `${kind === "registration" ? "ACAMPA" : "CAMISETA"}-${date}-${random}`;
}

function decodeReceipt(base64: string, mimeType: string) {
  if (!base64) return null;
  let binary: string;
  try {
    binary = atob(base64);
  } catch {
    throw new Error("invalid_receipt");
  }
  if (binary.length > 5 * 1024 * 1024) throw new Error("receipt_too_large");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const allowed =
    (mimeType === "application/pdf" && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46) ||
    (mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff) ||
    (mimeType === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47) ||
    (mimeType === "image/webp" && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50);
  if (!allowed) throw new Error("invalid_receipt");
  return bytes;
}

async function syncOperationalSheet(runtime: RuntimeEnv, submission: Submission, protocol: string) {
  if (!runtime.GOOGLE_APPS_SCRIPT_URL || !runtime.GOOGLE_APPS_SCRIPT_SECRET) return;
  const operational = submission.kind === "registration"
    ? {
        kind: submission.kind,
        protocol,
        idempotencyKey: submission.idempotencyKey,
        nome: submission.nome,
        idade: submission.idade,
        responsavel: submission.responsavel,
        telefone: submission.telefone,
        igreja: submission.igreja,
        endereco: submission.endereco,
        participou: submission.participou,
        camiseta: submission.camiseta,
        pagamento: submission.pagamento,
        hasReceipt: Boolean(submission.comprovanteBase64),
        consent: submission.consent,
        privacyVersion: submission.privacyVersion,
      }
    : {
        kind: submission.kind,
        protocol,
        idempotencyKey: submission.idempotencyKey,
        nome: submission.nome,
        telefone: submission.telefone,
        edition: submission.edition,
        size: submission.size,
        quantity: submission.quantity,
        pagamento: submission.pagamento,
        consent: submission.consent,
        privacyVersion: submission.privacyVersion,
      };

  try {
    await fetch(runtime.GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ ...operational, sharedSecret: runtime.GOOGLE_APPS_SCRIPT_SECRET }),
      signal: AbortSignal.timeout(4_000),
    });
  } catch {
    // A planilha é apenas uma cópia operacional; o banco permanece como fonte oficial.
  }
}

export async function POST(request: Request) {
  if (isSupabaseAdminConfigured()) {
    if (!process.env.RATE_LIMIT_SALT) return reply({ error: "O envio seguro ainda não foi configurado pela equipe." }, 503);
    const origin = request.headers.get("origin");
    if (origin && origin !== new URL(request.url).origin) return reply({ error: "Origem não autorizada." }, 403);
    let raw: unknown;
    try { raw = await request.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
    const parsed = submissionSchema.safeParse(raw);
    if (!parsed.success || parsed.data.website) return reply({ error: "Confira os campos enviados." }, 400);
    if (process.env.TURNSTILE_SECRET_KEY) try {
      const verification = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ secret: process.env.TURNSTILE_SECRET_KEY, response: parsed.data.turnstileToken, remoteip: request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() }),
        signal: AbortSignal.timeout(5_000),
      });
      const challenge = await verification.json() as { success?: boolean; action?: string; hostname?: string };
      const expectedAction = parsed.data.kind === "registration" ? "registration" : "shirt_order";
      const expectedHostname = new URL(request.url).hostname;
      if (!verification.ok || !challenge.success || challenge.action !== expectedAction || (challenge.hostname && challenge.hostname !== expectedHostname)) return reply({ error: "A verificação de segurança expirou. Atualize e tente novamente." }, 403);
    } catch { return reply({ error: "A verificação de segurança está indisponível. Tente novamente." }, 503); }
    try {
      const result = await persistSupabaseSubmission(parsed.data, request);
      return reply({ ok: true, ...result });
    } catch (error) {
      const code = error instanceof Error ? error.message : "";
      if (code === "rate_limited") return reply({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, 429);
      if (code === "receipt_too_large") return reply({ error: "O comprovante deve ter no máximo 5 MB." }, 400);
      if (code === "invalid_receipt") return reply({ error: "O arquivo enviado não é um comprovante válido." }, 400);
      return reply({ error: "Não foi possível salvar o envio. Tente novamente." }, 500);
    }
  }
  const runtime = env as unknown as RuntimeEnv;
  if (!runtime.DB || !runtime.TURNSTILE_SECRET_KEY || !runtime.RATE_LIMIT_SALT) {
    return reply({ error: "O envio seguro ainda não foi configurado pela equipe." }, 503);
  }

  const requestOrigin = request.headers.get("origin");
  if (requestOrigin && requestOrigin !== new URL(request.url).origin) return reply({ error: "Origem não autorizada." }, 403);
  if (!request.headers.get("content-type")?.includes("application/json")) return reply({ error: "Formato de envio inválido." }, 415);
  const contentLength = Number(request.headers.get("content-length") ?? "0");
  if (contentLength > 7_500_000) return reply({ error: "O envio ultrapassa o tamanho permitido." }, 413);

  let raw: unknown;
  try {
    const body = await request.text();
    if (body.length > 7_500_000) return reply({ error: "O envio ultrapassa o tamanho permitido." }, 413);
    raw = JSON.parse(body);
  } catch {
    return reply({ error: "Não foi possível ler os dados enviados." }, 400);
  }

  const parsed = submissionSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: parsed.error.issues[0]?.message ?? "Confira os campos e tente novamente." }, 400);
  const submission = parsed.data;
  if (submission.website) return reply({ error: "Envio recusado." }, 400);

  const previous = await runtime.DB.prepare("SELECT protocol FROM submission_receipts WHERE idempotency_key = ? LIMIT 1")
    .bind(submission.idempotencyKey).first<{ protocol: string }>();
  if (previous?.protocol) return reply({ ok: true, protocol: previous.protocol, duplicate: true });

  const ip = request.headers.get("cf-connecting-ip") ?? "unknown";
  let challenge: { success?: boolean; action?: string; hostname?: string };
  try {
    const turnstileResponse = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        secret: runtime.TURNSTILE_SECRET_KEY,
        response: submission.turnstileToken,
        remoteip: ip === "unknown" ? undefined : ip,
        idempotency_key: crypto.randomUUID(),
      }),
      signal: AbortSignal.timeout(5_000),
    });
    if (!turnstileResponse.ok) throw new Error("turnstile_unavailable");
    challenge = await turnstileResponse.json() as typeof challenge;
  } catch {
    return reply({ error: "A verificação de segurança está indisponível. Tente novamente em alguns instantes." }, 503);
  }
  const expectedAction = submission.kind === "registration" ? "registration" : "shirt_order";
  const expectedHostname = new URL(request.url).hostname;
  if (!challenge.success || challenge.action !== expectedAction || challenge.hostname !== expectedHostname) {
    return reply({ error: "A verificação de segurança expirou. Atualize e tente novamente." }, 403);
  }

  const fingerprint = await hashFingerprint(`${runtime.RATE_LIMIT_SALT}:${ip}`);
  const now = Math.floor(Date.now() / 1000);
  const windowStart = now - 15 * 60;
  await runtime.DB.prepare("DELETE FROM submission_attempts WHERE created_at < ?").bind(now - 24 * 60 * 60).run();
  const rateLimit = await runtime.DB.prepare(`INSERT INTO submission_attempts (fingerprint_hash, kind, created_at)
    SELECT ?, ?, ?
    WHERE (SELECT COUNT(*) FROM submission_attempts WHERE fingerprint_hash = ? AND created_at >= ?) < 5`)
    .bind(fingerprint, submission.kind, now, fingerprint, windowStart).run();
  if (!rateLimit.meta.changes) return reply({ error: "Muitas tentativas. Aguarde alguns minutos e tente novamente." }, 429);

  const protocol = createProtocol(submission.kind);
  let receiptBytes: Uint8Array | null = null;
  let receiptKey: string | null = null;
  if (submission.kind === "registration" && submission.comprovanteBase64) {
    try {
      receiptBytes = decodeReceipt(submission.comprovanteBase64, submission.comprovanteTipo);
    } catch (error) {
      const code = error instanceof Error ? error.message : "invalid_receipt";
      return reply({ error: code === "receipt_too_large" ? "O comprovante deve ter no máximo 5 MB." : "O arquivo enviado não é um comprovante válido." }, 400);
    }
    if (!runtime.BUCKET) return reply({ error: "O armazenamento seguro de comprovantes ainda não foi configurado." }, 503);
    const extension = submission.comprovanteTipo === "application/pdf" ? "pdf" : submission.comprovanteTipo.split("/")[1];
    receiptKey = `private/receipts/2027/${submission.idempotencyKey}.${extension}`;
  }

  try {
    if (submission.kind === "registration") {
      await runtime.DB.batch([
        runtime.DB.prepare(`INSERT INTO camp_registrations (
          protocol, idempotency_key, full_name, age, guardian_name, phone, church, location,
          allergies, medication, dietary_restrictions, attended_before, shirt_size, payment_method,
          payment_status, registration_status, notes, receipt_key, receipt_name, receipt_type,
          consent_at, privacy_version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?, ?, ?, ?, ?)`).bind(
          protocol, submission.idempotencyKey, submission.nome, submission.idade, submission.responsavel || null,
          submission.telefone, submission.igreja, submission.endereco, submission.alergias || null,
          submission.medicacao || null, submission.restricao || null, submission.participou, submission.camiseta,
          submission.pagamento, submission.obs || null, receiptKey, submission.comprovanteNome || null,
          submission.comprovanteTipo || null, now, submission.privacyVersion, now, now,
        ),
        runtime.DB.prepare("INSERT INTO submission_receipts (idempotency_key, protocol, kind, created_at) VALUES (?, ?, ?, ?)")
          .bind(submission.idempotencyKey, protocol, submission.kind, now),
      ]);
    } else {
      await runtime.DB.batch([
        runtime.DB.prepare(`INSERT INTO shirt_orders (
          protocol, idempotency_key, full_name, phone, edition, size, quantity, payment_method,
          payment_status, order_status, consent_at, privacy_version, created_at, updated_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending', 'pending', ?, ?, ?, ?)`).bind(
          protocol, submission.idempotencyKey, submission.nome, submission.telefone, submission.edition,
          submission.size, submission.quantity, submission.pagamento, now, submission.privacyVersion, now, now,
        ),
        runtime.DB.prepare("INSERT INTO submission_receipts (idempotency_key, protocol, kind, created_at) VALUES (?, ?, ?, ?)")
          .bind(submission.idempotencyKey, protocol, submission.kind, now),
      ]);
    }
  } catch {
    const duplicate = await runtime.DB.prepare("SELECT protocol FROM submission_receipts WHERE idempotency_key = ? LIMIT 1")
      .bind(submission.idempotencyKey).first<{ protocol: string }>();
    if (duplicate?.protocol) return reply({ ok: true, protocol: duplicate.protocol, duplicate: true });
    return reply({ error: "Não foi possível salvar a inscrição. Tente novamente." }, 500);
  }

  let receiptWarning = false;
  if (receiptBytes && receiptKey && runtime.BUCKET) {
    try {
      await runtime.BUCKET.put(receiptKey, receiptBytes, {
        httpMetadata: { contentType: submission.kind === "registration" ? submission.comprovanteTipo : "application/octet-stream" },
        customMetadata: { protocol },
      });
    } catch {
      receiptWarning = true;
      await runtime.DB.prepare("UPDATE camp_registrations SET receipt_key = NULL, updated_at = ? WHERE protocol = ?")
        .bind(Math.floor(Date.now() / 1000), protocol).run();
    }
  }

  await syncOperationalSheet(runtime, submission, protocol);
  return reply({ ok: true, protocol, receiptWarning });
}
