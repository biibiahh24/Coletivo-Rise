import {
  getAdminAuthConfigurationError as getConfigurationError,
  getConfiguredAdminIdentity,
  type AdminAuthConfig,
  type AdminIdentity,
} from "@/lib/admin-auth-core";
import { createSupabaseServerClient, isSupabaseConfigured } from "@/lib/supabase/server";
import { createSupabaseAdminClient, isSupabaseAdminConfigured } from "@/lib/supabase/admin";

type AdminRuntimeEnv = {
  ADMIN_EMAILS?: string;
  ADMIN_GATEWAY_SECRET?: string;
  ADMIN_TRUSTED_HEADER_AUTH?: string;
};

export type { AdminIdentity } from "@/lib/admin-auth-core";

function configuredAdminEmails() {
  const runtime = process.env as AdminRuntimeEnv;
  return new Set(
    (runtime.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function isConfiguredAdminEmail(email: string) {
  return configuredAdminEmails().has(email.trim().toLowerCase());
}

function configuredAdminAuth(): AdminAuthConfig {
  const runtime = process.env as AdminRuntimeEnv;
  return {
    adminEmails: configuredAdminEmails(),
    gatewaySecret: runtime.ADMIN_GATEWAY_SECRET,
    trustedHeaderAuth: runtime.ADMIN_TRUSTED_HEADER_AUTH === "true",
  };
}

export function getAdminAuthConfigurationError() {
  if (isSupabaseConfigured() && isSupabaseAdminConfigured()) return null;
  return getConfigurationError(configuredAdminAuth());
}

export function getAdminFromHeaders(requestHeaders: Pick<Headers, "get">): AdminIdentity | null {
  return getConfiguredAdminIdentity(requestHeaders, configuredAdminAuth());
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}

/** Supabase Auth is the primary admin identity. The gateway-header path remains
 * available only for the existing protected deployment during migration. */
export async function getAdminForRequest(requestHeaders: Pick<Headers, "get">): Promise<AdminIdentity | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createSupabaseServerClient();
      const { data: { user } } = await supabase.auth.getUser();
      const email = user?.email?.trim().toLowerCase();
      if (user && email) {
        const db = createSupabaseAdminClient();
        const { data: allowed } = await db.from("admin_users").select("email").eq("email", email).maybeSingle();
        if (allowed) return { email, displayName: (user.user_metadata?.full_name as string | undefined) ?? email };
      }
    } catch {
      // Configuration errors must not turn into an authorization bypass.
    }
  }
  return getAdminFromHeaders(requestHeaders);
}
