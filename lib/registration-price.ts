import { createSupabaseAdminClient } from "@/lib/supabase/admin";

export async function getRegistrationPrice(protocol: string) {
  const db = createSupabaseAdminClient();
  const { data: registration, error } = await db.from("camp_registrations")
    .select("id, shirt_size, notes").eq("protocol", protocol).maybeSingle();
  if (error || !registration) throw new Error("registration_unavailable");
  if (registration.notes?.includes("Presskit: Sim") || registration.notes?.includes("Presskit: em breve")) return 550;
  if (registration.notes?.startsWith("Inscrição com camiseta")) return 500;
  const { count, error: countError } = await db.from("camp_registrations")
    .select("id", { count: "exact", head: true }).lte("id", registration.id);
  if (countError || count === null) throw new Error("registration_unavailable");
  return count <= 10 ? 400 : 450;
}
