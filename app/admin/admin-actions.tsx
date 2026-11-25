"use client";

import { useState } from "react";
import type { FormEvent } from "react";
import { AlertTriangle, Check, DollarSign, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

type Props = {
  id: number;
  kind: "registration" | "shirt";
  status: string;
  paymentStatus: string;
  paidAmountCents?: number;
  demo?: boolean;
};

const registrationStatuses = [
  ["pending", "Pendente"],
  ["confirmed", "Confirmada"],
  ["waitlist", "Lista de espera"],
  ["cancelled", "Cancelada"],
] as const;

const orderStatuses = [
  ["pending", "Novo"],
  ["separated", "Separado"],
  ["delivered", "Entregue"],
  ["cancelled", "Cancelado"],
] as const;

const paymentStatuses = [
  ["pending", "Pendente"],
  ["partial", "Parcial"],
  ["paid", "Pago"],
  ["refunded", "Estornado"],
] as const;

export function AdminActions({ id, kind, status, paymentStatus, paidAmountCents = 0, demo = false }: Props) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextPayment, setNextPayment] = useState(paymentStatus);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [paymentOpen, setPaymentOpen] = useState(false);
  const [paymentAmount, setPaymentAmount] = useState("");
  const [paymentMethod, setPaymentMethod] = useState("Pix");
  const [paymentNotes, setPaymentNotes] = useState("");
  const [addingPayment, setAddingPayment] = useState(false);

  async function save() {
    setSaving(true);
    try {
      const response = await fetch("/api/admin/records", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ kind, id, status: nextStatus, paymentStatus: nextPayment }),
      });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível atualizar.");
      toast.success("Registro atualizado.");
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível atualizar.");
    } finally {
      setSaving(false);
    }
  }

  async function remove() {
    setConfirmOpen(true);
  }

  async function addPayment(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const amountCents = Math.round(Number(paymentAmount.replace(",", ".")) * 100);
    if (!Number.isFinite(amountCents) || amountCents <= 0) {
      toast.error("Informe um valor de pagamento válido.");
      return;
    }
    setAddingPayment(true);
    try {
      const response = await fetch("/api/admin/registration-payments", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ registrationId: id, amountCents, paymentMethod, notes: paymentNotes }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível registrar o pagamento.");
      toast.success("Pagamento adicionado à inscrição.");
      setPaymentOpen(false); setPaymentAmount(""); setPaymentNotes(""); router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível registrar o pagamento.");
    } finally { setAddingPayment(false); }
  }

  async function confirmRemove() {
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/records", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível apagar.");
      toast.success("Registro apagado.");
      setConfirmOpen(false);
      router.refresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não foi possível apagar.");
    } finally { setDeleting(false); }
  }

  const statuses = kind === "registration" ? registrationStatuses : orderStatuses;
  const changed = nextStatus !== status || nextPayment !== paymentStatus;

  return (
    <div className="admin-actions">
      <Toaster richColors position="top-center" />
      <label>
        <span>Status</span>
        <select value={nextStatus} onChange={(event) => setNextStatus(event.target.value)} disabled={demo}>
          {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      <label>
        <span>Pagamento</span>
        <select value={nextPayment} onChange={(event) => setNextPayment(event.target.value)} disabled={demo}>
          {paymentStatuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
        </select>
      </label>
      {kind === "registration" && <button type="button" className="admin-payment-button" onClick={() => setPaymentOpen(true)} disabled={demo || addingPayment}>
        <DollarSign /> Adicionar pagamento
      </button>}
      <button type="button" onClick={save} disabled={demo || !changed || saving} aria-label={demo ? "Alterações desativadas na demonstração" : "Salvar alterações"}>
        {saving ? <LoaderCircle className="spinner" /> : <Check />}
      </button>
      <button className="admin-delete-button" type="button" onClick={remove} disabled={demo || saving || deleting} aria-label={demo ? "Exclusão desativada na demonstração" : "Apagar registro"}>
        {deleting ? <LoaderCircle className="spinner" /> : <Trash2 />}
      </button>
      {confirmOpen && (
        <div className="admin-confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !deleting) setConfirmOpen(false); }}>
          <section className="admin-confirm-dialog" role="alertdialog" aria-modal="true" aria-labelledby={`delete-title-${kind}-${id}`}>
            <div className="admin-confirm-icon"><AlertTriangle /></div>
            <h2 id={`delete-title-${kind}-${id}`}>Apagar registro?</h2>
            <p>Esta ação remove permanentemente a requisição e não pode ser desfeita.</p>
            <div className="admin-confirm-actions">
              <button type="button" className="admin-confirm-cancel" onClick={() => setConfirmOpen(false)} disabled={deleting}>Cancelar</button>
              <button type="button" className="admin-confirm-delete" onClick={confirmRemove} disabled={deleting}>{deleting ? <LoaderCircle className="spinner" /> : "Apagar"}</button>
            </div>
          </section>
        </div>
      )}
      {paymentOpen && (
        <div className="admin-confirm-overlay" role="presentation" onMouseDown={(event) => { if (event.target === event.currentTarget && !addingPayment) setPaymentOpen(false); }}>
          <form className="admin-confirm-dialog admin-payment-dialog" onSubmit={addPayment}>
            <div className="admin-confirm-icon"><DollarSign /></div>
            <h2>Adicionar pagamento</h2>
            <p>Já registrado: R$ {(paidAmountCents / 100).toFixed(2).replace(".", ",")}</p>
            <label><span>Valor pago</span><input required inputMode="decimal" placeholder="0,00" value={paymentAmount} onChange={(event) => setPaymentAmount(event.target.value)} /></label>
            <label><span>Método</span><select value={paymentMethod} onChange={(event) => setPaymentMethod(event.target.value)}><option>Pix</option><option>Mercado Pago</option><option>Dinheiro</option><option>Transferência</option><option>Cartão</option><option>Outro</option></select></label>
            <label><span>Observação (opcional)</span><textarea maxLength={300} value={paymentNotes} onChange={(event) => setPaymentNotes(event.target.value)} /></label>
            <div className="admin-confirm-actions"><button type="button" className="admin-confirm-cancel" onClick={() => setPaymentOpen(false)} disabled={addingPayment}>Cancelar</button><button type="submit" className="admin-confirm-delete" disabled={addingPayment}>{addingPayment ? <LoaderCircle className="spinner" /> : "Registrar"}</button></div>
          </form>
        </div>
      )}
    </div>
  );
}

