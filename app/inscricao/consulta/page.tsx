import { RegistrationLookupPortal } from "../../components/registration-lookup-portal";

export const dynamic = "force-dynamic";

export default async function RegistrationLookupPage({ searchParams }: { searchParams: Promise<{ token?: string }> }) {
  const { token = "" } = await searchParams;
  return <RegistrationLookupPortal token={token} />;
}
