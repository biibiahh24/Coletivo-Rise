import { env } from "cloudflare:workers";

export const dynamic = "force-dynamic";

export async function GET() {
  const runtime = env as unknown as { TURNSTILE_SITE_KEY?: string };
  const siteKey = runtime.TURNSTILE_SITE_KEY ?? "";
  return Response.json(
    { configured: Boolean(siteKey), siteKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
