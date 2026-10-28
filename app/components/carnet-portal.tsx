"use client";

import { useEffect, useMemo, useState } from "react";
import { CircleDollarSign, LoaderCircle } from "lucide-react";
import { toast, Toaster } from "sonner";

type Plan = { full_name: string; total_amount_cents: number; paid_amount_cents: number; remaining_amount_cents: number; due_date: string; status: string };

export function CarnetPortal({ token }: { token: string }) {
  const [plan, setPlan] = useState<Plan | null>(null);
  const [amount, setAmount] = useState(5000);
  const [custom, setCustom] = useState("");
  const [loading, setLoading] = useState(true);
  const [paying, setPaying] = useState(false);
  useEffect(() => { fetch(`/api/carnes/${encodeURIComponent(token)}`).then(async (response) => { if (!response.ok) throw new Error("Carnê não encontrado."); return response.json() as Promise<Plan>; }).then((data) => { setPlan(data); setAmount(Math.min(5000, data.remaining_amount_cents)); }).catch((error) => toast.error(error.message)).finally(() => setLoading(false)); }, [token]);
  const remaining = plan?.remaining_amount_cents ?? 0;
  const selectedAmount = useMemo(() => custom ? Math.round(Number(custom.replace(",", ".")) * 100) : amount, [amount, custom]);
  async function checkout() {
    if (!selectedAmount || selectedAmount < Math.min(5000, remaining) || selectedAmount > remaining) { toast.error(remaining < 5000 ? "Informe o saldo restante." : "Escolha no mínimo R$ 50,00 e no máximo o saldo restante."); return; }
    setPaying(true);
    try { const response = await fetch("/api/carnes/checkout", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, amountCents: selectedAmount }) }); const data = await response.json() as { checkoutUrl?: string; error?: string }; if (!response.ok || !data.checkoutUrl) throw new Error(data.error ?? "Não foi possível abrir o checkout."); window.location.assign(data.checkoutUrl); } catch (error) { toast.error(error instanceof Error ? error.message : "Não foi possível abrir o checkout."); setPaying(false); }
  }
  return <main className="form-page"><Toaster richColors position="top-center" /><section className="section-shell form-shell carnet-shell"><span className="eyebrow">Meu carnê Rise</span>{loading ? <p>Carregando seu saldo...</p> : !plan ? <p>Não encontramos este carnê.</p> : <><h1>Olá, {plan.full_name.split(" ")[0]}.</h1><p>Você pode pagar até <strong>25 de janeiro de 2027</strong>.</p><div className="carnet-balance"><span>Saldo restante</span><strong>R$ {(remaining / 100).toFixed(2).replace(".", ",")}</strong></div>{remaining > 0 ? <><div className="carnet-options"><button type="button" onClick={() => { setCustom(""); setAmount(5000); }}>R$ 50,00</button><button type="button" onClick={() => { setCustom(""); setAmount(10000); }} disabled={remaining < 10000}>R$ 100,00</button><button type="button" onClick={() => { setCustom(""); setAmount(remaining); }}>Pagar tudo</button></div><label className="field"><span>Outro valor (mínimo de R$ 50,00)</span><input inputMode="decimal" value={custom} onChange={(event) => setCustom(event.target.value)} placeholder="Ex.: 150,00" /></label><button className="button button-orange" type="button" onClick={checkout} disabled={paying}>{paying ? <LoaderCircle className="spinner" /> : <CircleDollarSign size={18} />} Pagar no Mercado Pago</button></> : <strong>Este carnê está quitado.</strong>}</>}</section></main>;
}
