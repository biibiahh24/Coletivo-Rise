import Link from "next/link";
import { ShieldCheck } from "lucide-react";
import { headers } from "next/headers";
import { redirect } from "next/navigation";
import { getAdminForRequest } from "@/lib/admin-auth";
import { LoginForm } from "./login-form";

export const dynamic = "force-dynamic";

export default async function AdminLoginPage() {
  const admin = await getAdminForRequest(await headers());
  if (admin) redirect("/admin");

  return (
    <main className="admin-page admin-access-page">
      <section className="admin-access-card admin-login-card">
        <ShieldCheck aria-hidden="true" />
        <p className="eyebrow">Área administrativa</p>
        <h1>Login da equipe</h1>
        <p>Entre com o e-mail autorizado para acompanhar inscrições, pagamentos e pedidos de camiseta.</p>
        <LoginForm />
        <Link className="admin-login-back" href="/">← Voltar ao site</Link>
      </section>
    </main>
  );
}

