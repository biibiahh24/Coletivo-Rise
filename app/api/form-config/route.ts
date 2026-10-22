export const dynamic = "force-dynamic";

export async function GET() {
  const siteKey = process.env.TURNSTILE_SITE_KEY ?? "";
  return Response.json(
    { configured: Boolean(siteKey), siteKey },
    { headers: { "Cache-Control": "no-store" } },
  );
}
