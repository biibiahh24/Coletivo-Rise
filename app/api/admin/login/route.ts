import { z } from "zod";
import { isConfiguredAdminEmail, sameOrigin } from "@/lib/admin-auth";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";
import { createSupabaseServerClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const loginSchema = z.object({
  email: z.string().trim().email().max(254).transform((value) => value.toLowerCase()),
  password: z.string().min(10).max(128),
  next: z.string().max(300).default("/admin"),
});

function safeNext(value: string) {
  return value.startsWith("/") && !value.startsWith("//") ? value : "/admin";
}

const reply = (body: Record<string, unknown>, status = 200) => Response.json(body, { status, headers: { "Cache-Control": "no-store" } });

export async function POST(request: Request) {
  if (!sameOrigin(request)) return reply({ error: "Origem não autorizada." }, 403);
  if (!isSupabaseAdminConfigured()) return reply({ error: "O login administrativo ainda não foi configurado." }, 503);
  let raw: unknown;
  try { raw = await request.json(); } catch { return reply({ error: "Dados inválidos." }, 400); }
  const parsed = loginSchema.safeParse(raw);
  if (!parsed.success) return reply({ error: "Informe um e-mail válido e uma senha com ao menos 10 caracteres." }, 400);
  const { email, password, next } = parsed.data;
  const admin = createSupabaseAdminClient();
  const { data: listed } = await admin.from("admin_users").select("email").eq("email", email).maybeSingle();
  if (!listed && !isConfiguredAdminEmail(email)) return reply({ error: "E-mail ou senha inválidos." }, 401);

  const supabase = await createSupabaseServerClient();
  let login = await supabase.auth.signInWithPassword({ email, password });
  if (login.error) {
    const created = await admin.auth.admin.createUser({ email, password, email_confirm: true });
    if (!created.error) login = await supabase.auth.signInWithPassword({ email, password });
  }
  if (login.error || !login.data.user) return reply({ error: "E-mail ou senha inválidos." }, 401);

  const { error: allowlistError } = await admin.from("admin_users").upsert({ email }, { onConflict: "email" });
  if (allowlistError) {
    await supabase.auth.signOut();
    return reply({ error: "Não foi possível preparar o acesso administrativo." }, 500);
  }
  return reply({ ok: true, next: safeNext(next) });
}

