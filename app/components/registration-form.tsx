"use client";

import { useCallback, useRef, useState } from "react";
import { CheckCircle2, CircleDollarSign, HeartPulse, LoaderCircle, Send, Shirt, UserRound } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TurnstileWidget } from "./turnstile-widget";

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o comprovante."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

export function RegistrationForm({ initialLote = "", initialPresskit = "" }: { initialLote?: string; initialPresskit?: string }) {
  const [participou, setParticipou] = useState("");
  const [camiseta, setCamiseta] = useState("");
  const [corCamiseta, setCorCamiseta] = useState("");
  const [lote, setLote] = useState(initialLote);
  const [pagamento, setPagamento] = useState("");
  const [presskit, setPresskit] = useState(initialPresskit);
  const [confirmed, setConfirmed] = useState(false);
  const [submissionConfirmed, setSubmissionConfirmed] = useState(false);
  const [activeSection, setActiveSection] = useState(1);
  const [sending, setSending] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const idempotencyKey = useRef<string | null>(null);
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const submitter = (event.nativeEvent as SubmitEvent).submitter as HTMLButtonElement | null;
    const intent = submitter?.value === "pay-now" ? "pay-now" : "pay-later";
    if (!participou || !camiseta || !corCamiseta || !lote || !pagamento || !presskit || !confirmed || !turnstileToken) {
      toast.error("Preencha as seleções e confirme as informações para continuar.");
      return;
    }
    if (intent === "pay-now" && pagamento !== "PIX" && pagamento !== "Cartão") {
      toast.error("Para pagar agora, selecione PIX ou Cartão em forma de pagamento.");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);
    const file = formData.get("comprovante");
    if (file instanceof File && file.size > 5 * 1024 * 1024) {
      toast.error("O comprovante deve ter no máximo 5 MB.");
      return;
    }

    setSending(true);
    try {
      const comprovanteBase64 = file instanceof File && file.size ? await fileToBase64(file) : "";
      const text = (name: string) => String(formData.get(name) ?? "");
      const data = {
        kind: "registration",
        idempotencyKey: idempotencyKey.current ?? (idempotencyKey.current = crypto.randomUUID()),
        turnstileToken,
        website: text("website"),
        consent: confirmed,
        privacyVersion: "2026-10",
        nome: text("nome"),
        idade: text("idade"),
        responsavel: text("responsavel"),
        telefone: text("telefone"),
        igreja: text("igreja"),
        endereco: text("endereco"),
        alergias: text("alergias"),
        medicacao: text("medicacao"),
        restricao: text("restricao"),
        participou,
        camiseta,
        corCamiseta,
        pagamento,
        presskit,
        comprovanteBase64,
        comprovanteTipo: file instanceof File ? file.type : "",
        comprovanteNome: file instanceof File ? file.name : "",
        obs: `${lote ? `Lote: ${lote}. ` : ""}${text("obs")}`,
      };

      const response = await fetch("/api/submissions", {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      const result = await response.json() as { protocol?: string; error?: string; receiptWarning?: boolean };
      if (!response.ok || !result.protocol) throw new Error(result.error ?? "A inscrição não foi enviada.");
      idempotencyKey.current = null;
      if (intent === "pay-now" && result.protocol) {
        const checkoutResponse = await fetch("/api/mercadopago/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "registration", protocol: result.protocol, pagamento, lote: lote.startsWith("10 primeiras") ? "primeiras" : "proximas", presskit }),
        });
        const checkout = await checkoutResponse.json() as { checkoutUrl?: string; error?: string };
        if (!checkoutResponse.ok || !checkout.checkoutUrl) throw new Error(checkout.error ?? "A inscrição foi salva, mas não foi possível abrir o pagamento.");
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      setSubmissionConfirmed(true);
      toast.success(`Inscrição confirmada! Protocolo: ${result.protocol}`);
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos enviar agora. Tente novamente ou fale com a equipe pelo WhatsApp.");
      setResetSignal((value) => value + 1);
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      {submissionConfirmed && <div className="submission-success" role="status"><CheckCircle2 size={24} /><div><strong>Inscrição confirmada</strong><span>Recebemos seus dados. A equipe Rise foi notificada no Telegram.</span></div></div>}
      <form className="registration-form" onSubmit={handleSubmit}>
        <label className="form-honeypot" aria-hidden="true">Não preencha este campo<Input name="website" tabIndex={-1} autoComplete="off" /></label>
        <aside className="registration-progress" aria-label="Etapas da inscrição">
          <div className="registration-brand">COLETIVO <strong>RISE</strong><small>CAMP 2027</small></div>
          <ol>
            {["Dados pessoais", "Saúde e cuidado", "Preferências e pagamento"].map((label, index) => (
              <li key={label} className={activeSection === index + 1 ? "is-active" : ""}>
                <button type="button" onClick={() => setActiveSection(index + 1)} aria-current={activeSection === index + 1 ? "step" : undefined}>
                  <span>{String(index + 1).padStart(2, "0")}</span><strong>{label}</strong>
                </button>
              </li>
            ))}
          </ol>
          <div className="registration-verse">LEVANTA-TE<br />E RESPLANDECE<small>ISAÍAS 60:1</small></div>
        </aside>
        <div className="registration-main">
          <header className="registration-heading"><span className="eyebrow">Inscrição Rise Camp 2027</span><h1>Conte um pouco<br />sobre você.</h1><p>Faça sua inscrição no Coletivo Rise Camp 2027.</p></header>
        <fieldset className={activeSection === 1 ? "registration-section" : "registration-section is-hidden"}>
          <legend><span>01</span><UserRound /> Dados pessoais</legend>
          <div className="form-grid">
            <label className="field field-wide"><span>Nome completo *</span><Input name="nome" autoComplete="name" required placeholder="Seu nome e sobrenome" /></label>
            <label className="field"><span>Idade *</span><Input name="idade" type="number" min="10" max="99" required placeholder="Ex.: 18" /></label>
            <label className="field"><span>Responsável, se menor</span><Input name="responsavel" placeholder="Nome do responsável" /></label>
            <label className="field"><span>Telefone / WhatsApp *</span><Input name="telefone" type="tel" autoComplete="tel" required placeholder="(11) 99999-9999" /></label>
            <label className="field"><span>Igreja *</span><Input name="igreja" required placeholder="Nome da igreja" /></label>
            <label className="field field-wide"><span>Cidade / Bairro *</span><Input name="endereco" required placeholder="Ex.: São Paulo — Jardim Peri" /></label>
          </div>
        </fieldset>

        <fieldset className={activeSection === 2 ? "registration-section" : "registration-section is-hidden"}>
          <legend><span>02</span><HeartPulse /> Saúde e cuidado</legend>
          <p className="fieldset-note">Essas informações ajudam a equipe a preparar uma experiência segura.</p>
          <div className="form-grid">
            <label className="field"><span>Alergias</span><Input name="alergias" placeholder="Se não tiver, escreva nenhuma" /></label>
            <label className="field"><span>Uso de medicação</span><Input name="medicacao" placeholder="Nome e horário" /></label>
            <label className="field field-wide"><span>Restrição alimentar</span><Input name="restricao" placeholder="Ex.: lactose, glúten..." /></label>
          </div>
        </fieldset>

        <fieldset className={activeSection === 3 ? "registration-section" : "registration-section is-hidden"}>
          <legend><span>03</span><Shirt /> Preferências e pagamento</legend>
          <div className="form-grid">
            <label className="field"><span>Já participou antes? *</span>
              <Select value={participou} onValueChange={setParticipou} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent><SelectItem value="Sim">Sim</SelectItem><SelectItem value="Não">Não</SelectItem></SelectContent>
              </Select>
            </label>
            <label className="field"><span>Tamanho da camiseta *</span>
              <Select value={camiseta} onValueChange={setCamiseta} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{["PP", "P", "M", "G", "GG", "XG"].map((size) => <SelectItem value={size} key={size}>{size}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="field"><span>Cor da camiseta *</span>
              <Select value={corCamiseta} onValueChange={setCorCamiseta} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent><SelectItem value="Off-white">Off-white</SelectItem><SelectItem value="Roxa">Roxa</SelectItem></SelectContent>
              </Select>
            </label>
            <label className="field"><span>Lote da inscrição *</span>
              <Select value={lote} onValueChange={setLote} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar lote" /></SelectTrigger>
                <SelectContent><SelectItem value="10 primeiras vagas — R$ 400,00">10 primeiras vagas — R$ 400,00</SelectItem><SelectItem value="Próximas vagas — R$ 450,00">Próximas vagas — R$ 450,00</SelectItem></SelectContent>
              </Select>
            </label>
            <label className="field"><span>Forma de pagamento *</span>
              <Select value={pagamento} onValueChange={setPagamento} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{["PIX", "Cartão", "Dinheiro"].map((method) => <SelectItem value={method} key={method}>{method}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="field"><span>Adicionar presskit? (+ R$ 60,00) *</span>
              <Select value={presskit} onValueChange={setPresskit} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent><SelectItem value="Sim">Sim — adicionar presskit</SelectItem><SelectItem value="Não">Não, somente a inscrição</SelectItem></SelectContent>
              </Select>
            </label>
            <label className="field"><span>Comprovante (opcional, caso já tenha pago)</span><Input name="comprovante" type="file" accept="image/*,application/pdf" /></label>
            <label className="field field-wide"><span>Observações adicionais</span><Textarea name="obs" rows={4} placeholder="Algo importante que a equipe precisa saber?" /></label>
          </div>
        </fieldset>

        <div className="form-confirm">
          <Checkbox id="confirmacao" checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} />
          <label htmlFor="confirmacao">Confirmo que as informações são verdadeiras, autorizo o contato da equipe Rise e li a <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>. Em caso de participante menor, declaro ser responsável ou possuir sua autorização.</label>
        </div>

        <TurnstileWidget action="registration" onToken={handleToken} resetSignal={resetSignal} />

        <div className="form-submit-row">
          <div><CircleDollarSign /><span>Escolha pagar agora com PIX ou cartão, ou envie a inscrição para pagar depois.</span></div>
          <div className="form-submit-actions">
            <button className="button button-outline-orange" name="submitIntent" value="pay-later" type="submit" disabled={sending || !turnstileToken}>
              {sending ? <><LoaderCircle className="spinner" /> Enviando...</> : <>Enviar inscrição e pagar depois <Send size={18} /></>}
            </button>
            <button className="button button-orange" name="submitIntent" value="pay-now" type="submit" disabled={sending || !turnstileToken}>
              {sending ? <><LoaderCircle className="spinner" /> Abrindo...</> : <>Pagar agora <CircleDollarSign size={18} /></>}
            </button>
          </div>
        </div>
        </div>
      </form>
    </>
  );
}

