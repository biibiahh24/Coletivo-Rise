import { getRegistrationByToken } from "@/lib/carnet";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data, error } = await getRegistrationByToken(token);
  if (error || !data) return Response.json({ error: "Inscrição não encontrada." }, { status: 404, headers: { "Cache-Control": "no-store" } });
  return Response.json(data, { headers: { "Cache-Control": "no-store" } });
}
