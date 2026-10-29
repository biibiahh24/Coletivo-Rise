import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DUE_DATE = "2027-01-25";

export function normalizePhone(phone: string) {
  return phone.replace(/\D/g, "").slice(-13);
}

function lookupSecret() {
  // Accept both spellings so existing Vercel environments remain compatible.
  const secret = process.env.CARNE_LOOKUP_SECRET?.trim()
    ?? process.env.CARNET_LOOKUP_SECRET?.trim()
    ?? process.env.ADMIN_GATEWAY_SECRET?.trim();
  if (!secret) throw new Error("CARNE_LOOKUP_SECRET não configurado.");
  return secret;
}

function encodeBase64Url(value: string) {
  return btoa(value).replaceAll("+", "-").replaceAll("/", "_").replace(/=+$/, "");
}

function decodeBase64Url(value: string) {
  return atob(value.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - value.length % 4) % 4));
}

async function signLookupPayload(payload: string) {
  const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(lookupSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, new TextEncoder().encode(payload));
  return encodeBase64Url(String.fromCharCode(...new Uint8Array(signature)));
}

export async function createCarnetLookupToken(planId: string, phone: string) {
  const payload = encodeBase64Url(JSON.stringify({ id: planId, phone: normalizePhone(phone), exp: Date.now() + 30 * 60 * 1000 }));
  return `${payload}.${await signLookupPayload(payload)}`;
}

export function hashCarnetToken(token: string) {
  return crypto.subtle.digest("SHA-256", new TextEncoder().encode(token)).then((digest) =>
    Array.from(new Uint8Array(digest), (byte) => byte.toString(16).padStart(2, "0")).join(""),
  );
}

function createAccessToken() {
  return `${crypto.randomUUID()}${crypto.randomUUID().replaceAll("-", "")}`;
}

export async function createCarnetPlan(input: { protocol: string; fullName: string; phone: string }) {
  const db = createSupabaseAdminClient();
  const { count, error: countError } = await db.from("camp_registrations").select("protocol", { count: "exact", head: true });
  if (countError) throw countError;
  const totalAmountCents = (count ?? 0) <= 10 ? 40000 : 45000;
  const accessToken = createAccessToken();
  const accessTokenHash = await hashCarnetToken(accessToken);
  const now = Math.floor(Date.now() / 1000);
  const { data, error } = await db.from("carnet_plans").insert({
    registration_protocol: input.protocol,
    full_name: input.fullName,
    phone: input.phone,
    phone_normalized: normalizePhone(input.phone),
    access_token_hash: accessTokenHash,
    total_amount_cents: totalAmountCents,
    due_date: DUE_DATE,
    created_at: now,
    updated_at: now,
  }).select("id, total_amount_cents, paid_amount_cents, due_date, status").single();
  if (error || !data) throw error ?? new Error("carnet_creation_failed");
  return { ...data, accessToken };
}

export async function getCarnetByToken(token: string) {
  const hash = await hashCarnetToken(token);
  const db = createSupabaseAdminClient();
  const direct = await db.from("carnet_plans").select("id, registration_protocol, full_name, phone, total_amount_cents, paid_amount_cents, due_date, status").eq("access_token_hash", hash).maybeSingle();
  if (direct.data || direct.error) return direct;
  try {
    const [payload, signature] = token.split(".");
    if (!payload || !signature) throw new Error("invalid_token");
    const key = await crypto.subtle.importKey("raw", new TextEncoder().encode(lookupSecret()), { name: "HMAC", hash: "SHA-256" }, false, ["verify"]);
    const valid = await crypto.subtle.verify("HMAC", key, Uint8Array.from(atob(signature.replaceAll("-", "+").replaceAll("_", "/") + "=".repeat((4 - signature.length % 4) % 4)), (char) => char.charCodeAt(0)), new TextEncoder().encode(payload));
    const parsed = JSON.parse(decodeBase64Url(payload)) as { id?: string; phone?: string; exp?: number };
    if (!valid || !parsed.id || !parsed.phone || !parsed.exp || parsed.exp < Date.now()) throw new Error("invalid_token");
    return db.from("carnet_plans").select("id, registration_protocol, full_name, phone, total_amount_cents, paid_amount_cents, due_date, status").eq("id", parsed.id).eq("phone_normalized", parsed.phone).maybeSingle();
  } catch {
    return { data: null, error: null };
  }
}
