"use client";

import { useState } from "react";
import { Check, LoaderCircle, Trash2 } from "lucide-react";
import { useRouter } from "next/navigation";
import { toast, Toaster } from "sonner";

type Props = {
  id: number;
  kind: "registration" | "shirt";
  status: string;
  paymentStatus: string;
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

export function AdminActions({ id, kind, status, paymentStatus, demo = false }: Props) {
  const router = useRouter();
  const [nextStatus, setNextStatus] = useState(status);
  const [nextPayment, setNextPayment] = useState(paymentStatus);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

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
    if (!window.confirm("Apagar este registro permanentemente? Esta ação não pode ser desfeita.")) return;
    setDeleting(true);
    try {
      const response = await fetch("/api/admin/records", { method: "DELETE", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ kind, id }) });
      const result = await response.json() as { error?: string };
      if (!response.ok) throw new Error(result.error ?? "Não foi possível apagar.");
      toast.success("Registro apagado.");
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
      <button type="button" onClick={save} disabled={demo || !changed || saving} aria-label={demo ? "Alterações desativadas na demonstração" : "Salvar alterações"}>
        {saving ? <LoaderCircle className="spinner" /> : <Check />}
      </button>
      <button className="admin-delete-button" type="button" onClick={remove} disabled={demo || saving || deleting} aria-label={demo ? "Exclusão desativada na demonstração" : "Apagar registro"}>
        {deleting ? <LoaderCircle className="spinner" /> : <Trash2 />}
      </button>
    </div>
  );
}

