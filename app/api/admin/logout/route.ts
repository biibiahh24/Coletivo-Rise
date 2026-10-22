import { sameOrigin } from "@/lib/admin-auth";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export async function POST(request: Request) {
  if (!sameOrigin(request)) return Response.json({ error: "Origem não autorizada." }, { status: 403 });
  const supabase = await createSupabaseServerClient();
  await supabase.auth.signOut();
  return Response.json({ ok: true }, { headers: { "Cache-Control": "no-store" } });
}

