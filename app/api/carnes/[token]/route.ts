import { getCarnetByToken } from "@/lib/carnet";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ token: string }> }) {
  const { token } = await params;
  const { data, error } = await getCarnetByToken(token);
  if (error || !data) return Response.json({ error: "Carnê não encontrado." }, { status: 404 });
  return Response.json({ ...data, remaining_amount_cents: Math.max(0, data.total_amount_cents - data.paid_amount_cents) });
}
