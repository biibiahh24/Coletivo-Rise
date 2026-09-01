"use client";

import { useState } from "react";
import { CheckCircle2, CircleDollarSign, HeartPulse, LoaderCircle, Send, Shirt, UserRound } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

const endpoint = "https://script.google.com/macros/s/AKfycbyxPtgcrvpOMVKBsMWstHwHLO62mAf4jJWU_XLEDkb8ybauLt9zi6hTq1Lxwbo2J_aI/exec";

function fileToBase64(file: File) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("Não foi possível ler o comprovante."));
    reader.onload = () => resolve(String(reader.result).split(",")[1] ?? "");
    reader.readAsDataURL(file);
  });
}

export function RegistrationForm() {
  const [participou, setParticipou] = useState("");
  const [camiseta, setCamiseta] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [sending, setSending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!participou || !camiseta || !pagamento || !confirmed) {
      toast.error("Preencha as seleções e confirme as informações para continuar.");
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
      const data = {
        nome: formData.get("nome"),
        idade: formData.get("idade"),
        responsavel: formData.get("responsavel"),
        telefone: formData.get("telefone"),
        igreja: formData.get("igreja"),
        endereco: formData.get("endereco"),
        alergias: formData.get("alergias"),
        medicacao: formData.get("medicacao"),
        restricao: formData.get("restricao"),
        participou,
        camiseta,
        pagamento,
        comprovanteBase64,
        comprovanteTipo: file instanceof File ? file.type : "",
        comprovanteNome: file instanceof File ? file.name : "",
        obs: formData.get("obs"),
      };

      const response = await fetch(endpoint, {
        method: "POST",
        body: JSON.stringify(data),
        headers: { "Content-Type": "application/json" },
      });
      if (!response.ok) throw new Error("A inscrição não foi enviada.");
      const whatsappMessage = [
        "Olá, equipe Rise! Minha inscrição para o Acampamento 2027 foi registrada no site.",
        `Nome: ${String(data.nome ?? "")}`,
        `Idade: ${String(data.idade ?? "")}`,
        `Igreja: ${String(data.igreja ?? "")}`,
        `Camiseta: ${camiseta}`,
        `Pagamento: ${pagamento}`,
        "Gostaria de confirmar os próximos passos."
      ].join("\n");
      window.location.assign(`https://wa.me/5511968778688?text=${encodeURIComponent(whatsappMessage)}`);
    } catch {
      toast.error("Não conseguimos enviar agora. Tente novamente ou fale com a equipe pelo WhatsApp.");
    } finally {
      setSending(false);
    }
  }

  return (
    <>
      <Toaster richColors position="top-center" />
      <form className="registration-form" onSubmit={handleSubmit}>
        <fieldset>
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

        <fieldset>
          <legend><span>02</span><HeartPulse /> Saúde e cuidado</legend>
          <p className="fieldset-note">Essas informações ajudam a equipe a preparar uma experiência segura.</p>
          <div className="form-grid">
            <label className="field"><span>Alergias</span><Input name="alergias" placeholder="Se não tiver, escreva nenhuma" /></label>
            <label className="field"><span>Uso de medicação</span><Input name="medicacao" placeholder="Nome e horário" /></label>
            <label className="field field-wide"><span>Restrição alimentar</span><Input name="restricao" placeholder="Ex.: lactose, glúten..." /></label>
          </div>
        </fieldset>

        <fieldset>
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
            <label className="field"><span>Forma de pagamento *</span>
              <Select value={pagamento} onValueChange={setPagamento} required>
                <SelectTrigger className="form-select"><SelectValue placeholder="Selecionar" /></SelectTrigger>
                <SelectContent>{["PIX", "Cartão", "Dinheiro", "Entrada + Parcelamento"].map((method) => <SelectItem value={method} key={method}>{method}</SelectItem>)}</SelectContent>
              </Select>
            </label>
            <label className="field"><span>Comprovante, caso já tenha pago</span><Input name="comprovante" type="file" accept="image/*,application/pdf" /></label>
            <label className="field field-wide"><span>Observações adicionais</span><Textarea name="obs" rows={4} placeholder="Algo importante que a equipe precisa saber?" /></label>
          </div>
        </fieldset>

        <div className="form-confirm">
          <Checkbox id="confirmacao" checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} />
          <label htmlFor="confirmacao">Confirmo que as informações são verdadeiras e autorizo o contato da equipe Rise sobre esta inscrição.</label>
        </div>

        <div className="form-submit-row">
          <div><CircleDollarSign /><span>Após salvar na planilha, abriremos o WhatsApp com a confirmação pronta para envio.</span></div>
          <button className="button button-orange" type="submit" disabled={sending}>
            {sending ? <><LoaderCircle className="spinner" /> Enviando...</> : <>Enviar inscrição <Send size={18} /></>}
          </button>
        </div>
      </form>
    </>
  );
}
