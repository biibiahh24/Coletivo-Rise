import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import type { Submission } from "@/lib/submission-schema";
import { createCarnetPlan } from "@/lib/carnet";

async function fingerprint(value: string) {
  const digest = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(`${process.env.RATE_LIMIT_SALT}:${value}`));
  return Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join("");
}

function protocol(kind: Submission["kind"]) {
  const date = new Date().toISOString().slice(0, 10).replaceAll("-", "");
  return `${kind === "registration" ? "ACAMPA" : "CAMISETA"}-${date}-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`;
}

function decodeReceipt(base64: string, mimeType: string) {
  const binary = atob(base64);
  if (binary.length > 5 * 1024 * 1024) throw new Error("receipt_too_large");
  const bytes = Uint8Array.from(binary, (character) => character.charCodeAt(0));
  const valid = (mimeType === "application/pdf" && bytes[0] === 0x25 && bytes[1] === 0x50 && bytes[2] === 0x44 && bytes[3] === 0x46)
    || (mimeType === "image/jpeg" && bytes[0] === 0xff && bytes[1] === 0xd8 && bytes[2] === 0xff)
    || (mimeType === "image/png" && bytes[0] === 0x89 && bytes[1] === 0x50 && bytes[2] === 0x4e && bytes[3] === 0x47)
    || (mimeType === "image/webp" && bytes[0] === 0x52 && bytes[1] === 0x49 && bytes[2] === 0x46 && bytes[3] === 0x46 && bytes[8] === 0x57 && bytes[9] === 0x45 && bytes[10] === 0x42 && bytes[11] === 0x50);
  if (!valid) throw new Error("invalid_receipt");
  return bytes;
}

export async function persistSupabaseSubmission(submission: Submission, request: Request) {
  const db = createSupabaseAdminClient();
  const now = Math.floor(Date.now() / 1000);
  const { data: duplicate, error: duplicateError } = await db.from("submission_receipts").select("protocol").eq("idempotency_key", submission.idempotencyKey).maybeSingle();
  if (duplicateError) {
    console.error("Supabase submission lookup failed", duplicateError.code);
    throw new Error("submission_backend_unavailable");
  }
  if (duplicate?.protocol) return { protocol: duplicate.protocol, duplicate: true, receiptWarning: false };
  const ip = request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const { data: allowed, error: limitError } = await db.rpc("consume_submission_attempt", { p_fingerprint_hash: await fingerprint(ip), p_kind: submission.kind, p_now: now, p_window_start: now - 15 * 60 });
  if (limitError) {
    console.error("Supabase rate-limit RPC failed", limitError.code);
    throw new Error("submission_backend_unavailable");
  }
  if (allowed !== true) throw new Error("rate_limited");

  const id = protocol(submission.kind);
  let receiptKey: string | null = null;
  let receiptBytes: Uint8Array | null = null;
  let carnetAccessToken: string | null = null;
  if (submission.kind === "registration" && submission.comprovanteBase64) {
    receiptBytes = decodeReceipt(submission.comprovanteBase64, submission.comprovanteTipo);
    const extension = submission.comprovanteTipo === "application/pdf" ? "pdf" : submission.comprovanteTipo.split("/")[1];
    receiptKey = `private/${id}.${extension}`;
    const upload = await db.storage.from("receipts").upload(receiptKey, receiptBytes, { contentType: submission.comprovanteTipo, upsert: false });
    if (upload.error) throw new Error("receipt_upload_failed");
  }
  try {
    if (submission.kind === "registration") {
      const { error } = await db.from("camp_registrations").insert({ protocol: id, idempotency_key: submission.idempotencyKey, full_name: submission.nome, age: submission.idade, guardian_name: submission.responsavel || null, phone: submission.telefone, church: submission.igreja, location: submission.endereco, allergies: submission.alergias || null, medication: submission.medicacao || null, dietary_restrictions: submission.restricao || null, attended_before: submission.participou, shirt_size: submission.camiseta, payment_method: submission.pagamento, notes: `${submission.presskit === "Sim" ? "Presskit: Sim (valor será definido posteriormente). " : "Presskit: Não. "}Cor da camiseta: ${submission.corCamiseta}. ${submission.obs || ""}`, receipt_key: receiptKey, receipt_name: submission.comprovanteNome || null, receipt_type: submission.comprovanteTipo || null, consent_at: now, privacy_version: submission.privacyVersion, created_at: now, updated_at: now });
      if (error) throw error;
      if (submission.pagamento === "Carnê") {
        const carnet = await createCarnetPlan({ protocol: id, fullName: submission.nome, phone: submission.telefone });
        carnetAccessToken = carnet.accessToken;
      }
    } else {
      const { error } = await db.from("shirt_orders").insert({ protocol: id, idempotency_key: submission.idempotencyKey, full_name: submission.nome, phone: submission.telefone, edition: submission.edition, size: submission.size, quantity: submission.quantity, payment_method: submission.pagamento, consent_at: now, privacy_version: submission.privacyVersion, created_at: now, updated_at: now });
      if (error) throw error;
    }
    const { error: receiptError } = await db.from("submission_receipts").insert({ idempotency_key: submission.idempotencyKey, protocol: id, kind: submission.kind, created_at: now });
    if (receiptError) throw receiptError;
  } catch (error) {
    if (receiptKey) await db.storage.from("receipts").remove([receiptKey]);
    if (submission.kind === "registration") await db.from("camp_registrations").delete().eq("protocol", id);
    const { data: retry } = await db.from("submission_receipts").select("protocol").eq("idempotency_key", submission.idempotencyKey).maybeSingle();
    if (retry?.protocol) return { protocol: retry.protocol, duplicate: true, receiptWarning: false };
    throw error;
  }
  return { protocol: id, duplicate: false, receiptWarning: false, ...(carnetAccessToken ? { carnetUrl: `/carnes?token=${encodeURIComponent(carnetAccessToken)}` } : {}) };
}

