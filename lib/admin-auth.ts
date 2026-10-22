import { env } from "cloudflare:workers";

type AdminRuntimeEnv = {
  ADMIN_EMAILS?: string;
};

export type AdminIdentity = {
  email: string;
  displayName: string;
};

function configuredAdminEmails() {
  const runtime = env as unknown as AdminRuntimeEnv;
  return new Set(
    (runtime.ADMIN_EMAILS ?? "")
      .split(",")
      .map((email) => email.trim().toLowerCase())
      .filter(Boolean),
  );
}

export function getAdminFromHeaders(requestHeaders: Pick<Headers, "get">): AdminIdentity | null {
  const email = requestHeaders.get("oai-authenticated-user-email")?.trim().toLowerCase();
  if (!email || !configuredAdminEmails().has(email)) return null;

  const encodedName = requestHeaders.get("oai-authenticated-user-full-name");
  let displayName = email;
  if (encodedName && requestHeaders.get("oai-authenticated-user-full-name-encoding") === "percent-encoded-utf-8") {
    try {
      displayName = decodeURIComponent(encodedName);
    } catch {
      displayName = email;
    }
  }
  return { email, displayName };
}

export function sameOrigin(request: Request) {
  const origin = request.headers.get("origin");
  return !origin || origin === new URL(request.url).origin;
}
