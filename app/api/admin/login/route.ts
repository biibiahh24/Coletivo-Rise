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
  const { data: listed, error: allowlistLookupError } = await admin.from("admin_users").select("email").eq("email", email).maybeSingle();
  if (allowlistLookupError) {
    console.error("Admin allowlist lookup failed", allowlistLookupError.code);
    return reply({ error: "A configuração administrativa do servidor está indisponível. Cadastre a Secret Key do Supabase na Vercel." }, 503);
  }
  if (!listed && !isConfiguredAdminEmail(email)) return reply({ error: "E-mail ou senha inválidos." }, 401);

  const supabase = await createSupabaseServerClient();
  const login = await supabase.auth.signInWithPassword({ email, password });
  if (login.error || !login.data.user) return reply({ error: "E-mail ou senha inválidos." }, 401);
  return reply({ ok: true, next: safeNext(next) });
}


