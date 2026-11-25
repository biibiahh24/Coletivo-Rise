"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";

export function RegistrationLookupModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  useEffect(() => { inputRef.current?.focus(); const handler = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); }; document.addEventListener("keydown", handler); return () => document.removeEventListener("keydown", handler); }, [onClose]);
  async function findRegistration(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setError(""); setLoading(true);
    try {
      const response = await fetch("/api/inscricoes/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const data = await response.json() as { token?: string; error?: string };
      if (!response.ok || !data.token) throw new Error(data.error ?? "Não encontramos uma inscrição para este número.");
      window.location.assign(`/inscricao/consulta?token=${encodeURIComponent(data.token)}`);
    } catch (lookupError) { setError(lookupError instanceof Error ? lookupError.message : "Não foi possível consultar a inscrição."); setLoading(false); }
  }
  return <div className="carnet-lookup-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}><section className="carnet-lookup-modal" role="dialog" aria-modal="true" aria-labelledby="registration-lookup-title"><button className="carnet-lookup-close" type="button" onClick={onClose} aria-label="Fechar consulta"><X size={22} /></button><span className="eyebrow">Minha inscrição Rise</span><h2 id="registration-lookup-title">Acompanhe sua inscrição.</h2><p>Digite o telefone usado no cadastro para consultar o andamento da inscrição e do pagamento.</p><form className="carnet-lookup" onSubmit={findRegistration}><label className="field"><span>Seu telefone</span><input ref={inputRef} required inputMode="numeric" maxLength={11} value={phone} onChange={(event) => setPhone(event.target.value.replace(/\D/g, ""))} placeholder="11999999999" /></label>{error && <p className="carnet-lookup-error" role="alert">{error}</p>}<button className="button button-orange" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spinner" /> : "Consultar inscrição"}</button></form></section></div>;
}
