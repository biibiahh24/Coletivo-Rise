"use client";

import { useEffect, useState } from "react";
import { LoaderCircle } from "lucide-react";

type Registration = { full_name: string; protocol: string; registration_status: string; payment_status: string; payment_method: string; shirt_size: string; notes: string | null; created_at: number; carnet?: { totalAmountCents: number; paidAmountCents: number; remainingAmountCents: number; dueDate: string; status: string; url: string } };
const labels: Record<string, string> = { pending: "Em análise", confirmed: "Confirmada", waitlist: "Lista de espera", cancelled: "Cancelada", paid: "Pago", partial: "Pagamento parcial", overdue: "Pagamento atrasado" };
function label(value: string) { return labels[value] ?? value; }
function hasPresskit(notes: string | null) { return (notes ?? "").toLocaleLowerCase("pt-BR").includes("presskit: sim"); }

export function RegistrationLookupPortal({ token }: { token: string }) {
  const [registration, setRegistration] = useState<Registration | null>(null);
  const [loading, setLoading] = useState(Boolean(token));
  useEffect(() => { if (!token) return; fetch(`/api/inscricoes/${encodeURIComponent(token)}`).then(async (response) => { if (!response.ok) throw new Error("Inscrição não encontrada."); return response.json() as Promise<Registration>; }).then(setRegistration).catch(() => setRegistration(null)).finally(() => setLoading(false)); }, [token]);
  return <main className="form-page"><section className="section-shell form-shell carnet-shell"><span className="eyebrow">Minha inscrição Rise</span>{!token ? <><h1>Acompanhe sua inscrição.</h1><p>Use o botão “Minha inscrição” no menu e informe o telefone usado no cadastro.</p></> : loading ? <p><LoaderCircle className="spinner" /> Consultando inscrição...</p> : !registration ? <><h1>Inscrição não encontrada.</h1><p>Confira o telefone informado ou fale com a equipe pelo WhatsApp.</p></> : <><h1>Olá, {registration.full_name.split(" ")[0]}.</h1><p>Protocolo <strong>{registration.protocol}</strong></p><div className="registration-status-card"><div><span>Status da inscrição</span><strong>{label(registration.registration_status)}</strong></div><div><span>Pagamento</span><strong>{label(registration.payment_status)} · {registration.payment_method}</strong></div><div><span>Ingresso</span><strong>{hasPresskit(registration.notes) ? "Com presskit" : registration.shirt_size !== "Sem camiseta" ? "Com camiseta" : "Inscrição"}</strong></div></div>{registration.carnet && <div className="registration-carnet-card"><span className="eyebrow">Carnê da inscrição</span><strong>Saldo: R$ {(registration.carnet.remainingAmountCents / 100).toFixed(2).replace(".", ",")}</strong><span>Vencimento: {new Intl.DateTimeFormat("pt-BR").format(new Date(`${registration.carnet.dueDate}T12:00:00`))}</span><a className="button button-orange" href={registration.carnet.url}>Abrir meu carnê</a></div>}<p className="registration-lookup-note">Se precisar alterar alguma informação, entre em contato com a equipe Rise pelo WhatsApp informado no site.</p></>}</section></main>;
}
