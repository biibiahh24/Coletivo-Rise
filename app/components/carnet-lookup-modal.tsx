"use client";

import { useEffect, useRef, useState, type FormEvent } from "react";
import { LoaderCircle, X } from "lucide-react";

export function CarnetLookupModal({ onClose }: { onClose: () => void }) {
  const [phone, setPhone] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
    const handleKeyDown = (event: KeyboardEvent) => { if (event.key === "Escape") onClose(); };
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [onClose]);

  async function findCarnet(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setLoading(true);
    try {
      const response = await fetch("/api/carnes/lookup", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const raw = await response.text();
      let data: { token?: string; error?: string } = {};
      try { data = JSON.parse(raw) as { token?: string; error?: string }; } catch { /* API/network errors can return an empty body. */ }
      if (!raw) throw new Error("Não foi possível consultar o carnê agora. Tente novamente.");
      if (!response.ok || !data.token) throw new Error(data.error ?? "Não encontramos um carnê para este número.");
      window.location.assign(`/carnes?token=${encodeURIComponent(data.token)}`);
    } catch (lookupError) {
      setError(lookupError instanceof Error ? lookupError.message : "Não foi possível consultar o carnê.");
      setLoading(false);
    }
  }

  return <div className="carnet-lookup-backdrop" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget) onClose(); }}>
    <section className="carnet-lookup-modal" role="dialog" aria-modal="true" aria-labelledby="carnet-lookup-title">
      <button className="carnet-lookup-close" type="button" onClick={onClose} aria-label="Fechar consulta"><X size={22} /></button>
      <span className="eyebrow">Meu carnê Rise</span>
      <h2 id="carnet-lookup-title">Consulte seu carnê.</h2>
      <p>Digite o número de telefone usado na inscrição para acessar seu saldo e pagamentos.</p>
      <form className="carnet-lookup" onSubmit={findCarnet}>
        <label className="field"><span>Seu telefone</span><input ref={inputRef} required inputMode="tel" value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="(11) 99999-9999" /></label>
        {error && <p className="carnet-lookup-error" role="alert">{error}</p>}
        <button className="button button-orange" type="submit" disabled={loading}>{loading ? <LoaderCircle className="spinner" /> : "Acessar meu carnê"}</button>
      </form>
    </section>
  </div>;
}
