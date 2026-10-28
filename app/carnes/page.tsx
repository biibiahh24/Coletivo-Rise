import { CarnetPortal } from "../components/carnet-portal";

export const dynamic = "force-dynamic";

export default async function CarnesPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <CarnetPortal token={token} />;
}
