import { headers } from "next/headers";
import Link from "next/link";
import { Download, FileCheck2, LogOut, Search, ShieldCheck, Shirt, UsersRound } from "lucide-react";
import { redirect } from "next/navigation";
import { getAdminForRequest } from "@/lib/admin-auth";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { AdminActions } from "./admin-actions";
import { AdminSignOut } from "./admin-sign-out";

export const dynamic = "force-dynamic";

type SearchParams = Promise<{ view?: string; q?: string; status?: string }>;

type Registration = {
  id: number;
  protocol: string;
  full_name: string;
  age: number;
  guardian_name: string | null;
  phone: string;
  church: string;
  location: string;
  allergies: string | null;
  medication: string | null;
  dietary_restrictions: string | null;
  attended_before: string;
  shirt_size: string;
  payment_method: string;
  payment_status: string;
  registration_status: string;
  notes: string | null;
  receipt_key: string | null;
  created_at: number;
};

type ShirtOrder = {
  id: number;
  protocol: string;
  full_name: string;
  phone: string;
  edition: string;
  size: string;
  quantity: number;
  payment_method: string;
  payment_status: string;
  order_status: string;
  created_at: number;
};

// Keep production free of personal/demo records. Data is loaded from Supabase;
// empty fallbacks also make the admin panel safe in local development.
const demoRegistrations: Registration[] = [];
const demoShirts: ShirtOrder[] = [];

function isLocalDevelopment(requestHeaders: Headers) {
  const host = (requestHeaders.get("x-forwarded-host") ?? requestHeaders.get("host") ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0];
  return process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "terminal.local");
}

function formatDate(timestamp: number) {
  return new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Sao_Paulo" })
    .format(new Date(timestamp * 1000));
}

function statusLabel(value: string) {
  return ({ pending: "Pendente", confirmed: "Confirmada", waitlist: "Lista de espera", cancelled: "Cancelada", separated: "Separado", delivered: "Entregue", partial: "Parcial", paid: "Pago", refunded: "Estornado" } as Record<string, string>)[value] ?? value;
}

function hasPresskit(item: Registration) {
  return (item.notes ?? "").toLocaleLowerCase("pt-BR").includes("presskit: sim");
}

export default async function AdminPage({ searchParams }: { searchParams: SearchParams }) {
  const requestHeaders = await headers();
  const localDemo = isLocalDevelopment(requestHeaders);
  const admin = localDemo
    ? { email: "demonstracao@localhost", displayName: "Equipe Rise" }
    : await getAdminForRequest(requestHeaders);
  if (!admin) redirect("/admin/login?next=/admin");

  const db = localDemo ? null : createSupabaseAdminClient();
  const params = await searchParams;
  const view = params.view === "shirts" ? "shirts" : params.view === "registrations_presskit" ? "registrations_presskit" : "registrations";
  const query = (params.q ?? "").trim().slice(0, 120);
  const filterStatus = (params.status ?? "").trim();
  const counts = localDemo
    ? {
        registrations: demoRegistrations.length,
        confirmed: demoRegistrations.filter((item) => item.registration_status === "confirmed").length,
        paid: demoRegistrations.filter((item) => item.payment_status === "paid").length,
        shirts: demoShirts.length,
      }
    : await Promise.all([
        db!.from("camp_registrations").select("*", { count: "exact", head: true }),
        db!.from("camp_registrations").select("*", { count: "exact", head: true }).eq("registration_status", "confirmed"),
        db!.from("camp_registrations").select("*", { count: "exact", head: true }).eq("payment_status", "paid"),
        db!.from("shirt_orders").select("*", { count: "exact", head: true }),
      ]).then(([registrations, confirmed, paid, shirts]) => ({
        registrations: registrations.count ?? 0,
        confirmed: confirmed.count ?? 0,
        paid: paid.count ?? 0,
        shirts: shirts.count ?? 0,
      }));

  let registrations: Registration[] = [];
  let shirts: ShirtOrder[] = [];
  if (view === "registrations" || view === "registrations_presskit") {
    if (localDemo) {
      const normalizedQuery = query.toLocaleLowerCase("pt-BR");
        registrations = demoRegistrations.filter((item) =>
        (view === "registrations_presskit" ? hasPresskit(item) : !hasPresskit(item)) &&
        (!normalizedQuery || [item.full_name, item.protocol, item.phone].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery))) &&
        (!filterStatus || item.registration_status === filterStatus),
      );
    } else {
      let request = db!.from("camp_registrations").select("*").order("created_at", { ascending: false }).limit(500);
      if (filterStatus) request = request.eq("registration_status", filterStatus);
      const result = await request;
      if (result.error) throw result.error;
      const normalizedQuery = query.toLocaleLowerCase("pt-BR");
      registrations = (result.data as Registration[]).filter((item) =>
        (view === "registrations_presskit" ? hasPresskit(item) : !hasPresskit(item)) &&
        (!normalizedQuery || [item.full_name, item.protocol, item.phone].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery))));
    }
  } else {
    if (localDemo) {
      const normalizedQuery = query.toLocaleLowerCase("pt-BR");
      shirts = demoShirts.filter((item) =>
        (!normalizedQuery || [item.full_name, item.protocol, item.phone].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery))) &&
        (!filterStatus || item.order_status === filterStatus),
      );
    } else {
      let request = db!.from("shirt_orders").select("*").order("created_at", { ascending: false }).limit(500);
      if (filterStatus) request = request.eq("order_status", filterStatus);
      const result = await request;
      if (result.error) throw result.error;
      const normalizedQuery = query.toLocaleLowerCase("pt-BR");
      shirts = (result.data as ShirtOrder[]).filter((item) => !normalizedQuery
        || [item.full_name, item.protocol, item.phone].some((value) => value.toLocaleLowerCase("pt-BR").includes(normalizedQuery)));
    }
  }

  return (
    <main className="admin-page">
      <section className="admin-shell">
        <header className="admin-heading">
          <div>
            <p className="eyebrow">Painel protegido</p>
            <h1>Central Rise</h1>
            <p>Olá, {admin.displayName}. Acompanhe inscrições e pedidos sem depender da planilha.</p>
          </div>
          {localDemo
            ? <Link className="admin-signout" href="/"><LogOut /> Voltar ao site</Link>
            : <AdminSignOut />}
        </header>

        {localDemo && (
          <aside className="admin-demo-notice" role="status">
            <ShieldCheck />
            <div><strong>Modo de demonstração local</strong><span>Os registros abaixo são exemplos. As alterações e os comprovantes ficam desativados; o CSV pode ser baixado para teste.</span></div>
          </aside>
        )}

        <div className="admin-stats" aria-label="Resumo">
          <article><UsersRound /><span>Inscrições</span><strong>{Number(counts?.registrations ?? 0)}</strong></article>
          <article><FileCheck2 /><span>Confirmadas</span><strong>{Number(counts?.confirmed ?? 0)}</strong></article>
          <article><ShieldCheck /><span>Pagas</span><strong>{Number(counts?.paid ?? 0)}</strong></article>
          <article><Shirt /><span>Pedidos</span><strong>{Number(counts?.shirts ?? 0)}</strong></article>
        </div>

        <div className="admin-toolbar">
          <nav aria-label="Tipos de registro">
            <Link className={view === "registrations" ? "active" : ""} href="/admin?view=registrations">Acampamento</Link>
            <Link className={view === "registrations_presskit" ? "active" : ""} href="/admin?view=registrations_presskit">Acampamento + Presskit</Link>
            <Link className={view === "shirts" ? "active" : ""} href="/admin?view=shirts">Camisetas</Link>
          </nav>
          {localDemo
            ? <a className="admin-export" href={`/api/admin/demo-export?kind=${view === "registrations" ? "registration" : "shirt"}`} download><Download /> Exportar CSV</a>
            : <a className="admin-export" href={`/api/admin/export?kind=${view === "registrations" ? "registration" : "shirt"}`}><Download /> Exportar CSV</a>}
        </div>

        <form className="admin-filters" method="get">
          <input type="hidden" name="view" value={view} />
          <label><Search /><input name="q" defaultValue={query} placeholder="Buscar nome, protocolo ou telefone" /></label>
          <select name="status" defaultValue={filterStatus} aria-label="Filtrar por status">
            <option value="">Todos os status</option>
            {(view === "registrations" || view === "registrations_presskit"
              ? [["pending", "Pendente"], ["confirmed", "Confirmada"], ["waitlist", "Lista de espera"], ["cancelled", "Cancelada"]]
              : [["pending", "Novo"], ["separated", "Separado"], ["delivered", "Entregue"], ["cancelled", "Cancelado"]]
            ).map(([value, label]) => <option value={value} key={value}>{label}</option>)}
          </select>
          <button type="submit">Filtrar</button>
        </form>

        {view === "registrations" ? (
          <div className="admin-records">
            {registrations.length === 0 && <p className="admin-empty">Nenhuma inscrição encontrada.</p>}
            {registrations.map((item) => (
              <article className="admin-record" key={item.id}>
                <div className="admin-record-main">
                  <div><span className={`status-badge status-${item.registration_status}`}>{statusLabel(item.registration_status)}</span><small>{item.protocol}</small></div>
                  <h2>{item.full_name}</h2>
                  <p>{item.age} anos · {item.church} · {item.location}</p>
                  <div className="admin-record-meta"><span>{item.phone}</span><span>Camiseta {item.shirt_size}</span><span>{item.payment_method} · {statusLabel(item.payment_status)}</span>{hasPresskit(item) && <span>Presskit + R$ 60,00</span>}<span>{formatDate(item.created_at)}</span></div>
                </div>
                <AdminActions id={item.id} kind="registration" status={item.registration_status} paymentStatus={item.payment_status} demo={localDemo} />
                <details className="admin-details">
                  <summary>Ver informações de cuidado e observações</summary>
                  <dl>
                    <div><dt>Responsável</dt><dd>{item.guardian_name || "Não informado"}</dd></div>
                    <div><dt>Alergias</dt><dd>{item.allergies || "Nenhuma informada"}</dd></div>
                    <div><dt>Medicação</dt><dd>{item.medication || "Nenhuma informada"}</dd></div>
                    <div><dt>Restrição alimentar</dt><dd>{item.dietary_restrictions || "Nenhuma informada"}</dd></div>
                    <div><dt>Participou antes</dt><dd>{item.attended_before}</dd></div>
                    <div><dt>Observações</dt><dd>{item.notes || "Sem observações"}</dd></div>
                  </dl>
                  {item.receipt_key && <a className="receipt-link" href={`/api/admin/receipt?id=${item.id}`} target="_blank" rel="noreferrer">Abrir comprovante</a>}
                </details>
              </article>
            ))}
          </div>
        ) : (
          <div className="admin-records">
            {shirts.length === 0 && <p className="admin-empty">Nenhum pedido encontrado.</p>}
            {shirts.map((item) => (
              <article className="admin-record" key={item.id}>
                <div className="admin-record-main">
                  <div><span className={`status-badge status-${item.order_status}`}>{statusLabel(item.order_status)}</span><small>{item.protocol}</small></div>
                  <h2>{item.full_name}</h2>
                  <p>{item.edition} · Tamanho {item.size} · {item.quantity} unidade(s)</p>
                  <div className="admin-record-meta"><span>{item.phone}</span><span>{item.payment_method} · {statusLabel(item.payment_status)}</span><span>{formatDate(item.created_at)}</span></div>
                </div>
                <AdminActions id={item.id} kind="shirt" status={item.order_status} paymentStatus={item.payment_status} demo={localDemo} />
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}

