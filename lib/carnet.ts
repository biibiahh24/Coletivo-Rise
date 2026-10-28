import { createSupabaseAdminClient } from "@/lib/supabase/admin";

const DUE_DATE = "2027-01-25";

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
  return db.from("carnet_plans").select("id, registration_protocol, full_name, total_amount_cents, paid_amount_cents, due_date, status").eq("access_token_hash", hash).maybeSingle();
}
