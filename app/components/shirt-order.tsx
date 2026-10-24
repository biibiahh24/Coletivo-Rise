"use client";

import { useCallback, useRef, useState } from "react";
import { LoaderCircle, MessageCircle, Send } from "lucide-react";
import { toast, Toaster } from "sonner";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { TurnstileWidget } from "./turnstile-widget";

export function ShirtOrder() {
  const shirtEditions = [
    { value: "edition-01", label: "01 - Camiseta Rise - Coleção 1" },
    { value: "edition-02", label: "02 - Camiseta Rise - Acampa" },
  ] as const;
  const [product, setProduct] = useState<"shirt" | "presskit">("shirt");
  const [shirtEdition, setShirtEdition] = useState<(typeof shirtEditions)[number]["value"]>(shirtEditions[0].value);
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("1");
  const [color, setColor] = useState("");
  const [pagamento, setPagamento] = useState("");
  const [sending, setSending] = useState(false);
  const [confirmed, setConfirmed] = useState(false);
  const [turnstileToken, setTurnstileToken] = useState("");
  const [resetSignal, setResetSignal] = useState(0);
  const idempotencyKey = useRef<string | null>(null);
  const handleToken = useCallback((token: string) => setTurnstileToken(token), []);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const colorRequired = product === "shirt" && shirtEdition === "edition-02";
    if (!shirtEdition || !size || !pagamento || !turnstileToken || !confirmed || (colorRequired && !color)) return;
    const selectedEdition = shirtEditions.find((item) => item.value === shirtEdition)?.label ?? shirtEditions[0].label;
    const data = new FormData(event.currentTarget);
    setSending(true);
    try {
      const response = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          kind: "shirt",
          idempotencyKey: idempotencyKey.current ?? (idempotencyKey.current = crypto.randomUUID()),
          turnstileToken,
          website: data.get("website"),
          consent: confirmed,
          privacyVersion: "2026-10",
          nome: data.get("nome"),
          telefone: data.get("telefone"),
          edition: product === "presskit" ? "Presskit Rise" : selectedEdition,
          size,
          color: colorRequired ? color : null,
          quantity,
          pagamento,
        }),
      });
      const result = await response.json() as { protocol?: string; error?: string };
      if (!response.ok || !result.protocol) throw new Error(result.error ?? "O pedido não foi registrado.");
      idempotencyKey.current = null;
      if ((pagamento === "PIX" || pagamento === "Cartão") && result.protocol) {
        const checkoutResponse = await fetch("/api/mercadopago/checkout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ kind: "shirt", protocol: result.protocol, pagamento, product, quantity }),
        });
        const checkout = await checkoutResponse.json() as { checkoutUrl?: string; error?: string };
        if (!checkoutResponse.ok || !checkout.checkoutUrl) throw new Error(checkout.error ?? "O pedido foi salvo, mas não foi possível abrir o pagamento.");
        window.location.assign(checkout.checkoutUrl);
        return;
      }
      const message = [
        "Olá, equipe Rise! Meu pedido de camiseta foi registrado no site.",
        `Protocolo: ${result.protocol}`,
        `Nome: ${String(data.get("nome") ?? "")}`,
        `Modelo: ${product === "presskit" ? "Presskit Rise" : selectedEdition}`,
        `Tamanho: ${size}`,
        `Quantidade: ${quantity}`,
        `Pagamento: ${pagamento}`,
        "Podem me confirmar a disponibilidade e o pagamento?"
      ].join("\n");
      const whatsappNumber = pagamento === "Dinheiro" ? "5511971590456" : "5511968778688";
      window.open(`https://wa.me/${whatsappNumber}?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Não conseguimos registrar o pedido agora.");
      setResetSignal((value) => value + 1);
    } finally {
      setSending(false);
    }
  }

  return (
    <form className="shirt-order" onSubmit={handleSubmit}>
      <Toaster richColors position="top-center" />
      <label className="form-honeypot" aria-hidden="true">Não preencha este campo<Input name="website" tabIndex={-1} autoComplete="off" /></label>
      <label className="field field-name"><span>Seu nome *</span><Input name="nome" required placeholder="Como podemos te chamar?" /></label>
      <label className="field field-phone"><span>Telefone / WhatsApp *</span><Input name="telefone" type="tel" autoComplete="tel" required placeholder="(11) 99999-9999" /></label>
      <div className="field order-product-picker"><span>Escolha o produto *</span>
        <div className="order-product-options" role="group" aria-label="Escolha o produto">
          <button type="button" className={product === "shirt" ? "is-selected" : ""} onClick={() => setProduct("shirt")} aria-pressed={product === "shirt"}>
            <strong>Só camiseta</strong><span>Camiseta Rise</span><b>EM BREVE</b>
          </button>
          <button type="button" className={product === "presskit" ? "is-selected" : ""} onClick={() => setProduct("presskit")} aria-pressed={product === "presskit"}>
            <strong>Só presskit</strong><span>Kit completo Rise</span><b>EM BREVE</b>
          </button>
        </div>
      </div>
      <label className="field field-model"><span>Modelo</span>
        {product === "presskit" ? (
          <Input value="Presskit Rise" readOnly aria-readonly="true" />
        ) : (
          <Select value={shirtEdition} onValueChange={(value) => setShirtEdition(value as typeof shirtEdition)} required>
            <SelectTrigger className="form-select"><SelectValue /></SelectTrigger>
            <SelectContent>{shirtEditions.map((item) => <SelectItem value={item.value} key={item.value}>{item.label}</SelectItem>)}</SelectContent>
          </Select>
        )}
      </label>
      <label className="field field-size"><span>Tamanho *</span>
        <Select value={size} onValueChange={setSize} required>
          <SelectTrigger className="form-select"><SelectValue placeholder="Escolha o tamanho" /></SelectTrigger>
          <SelectContent>{["P", "M", "G", "GG"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <label className="field field-quantity"><span>Quantidade *</span>
        <Select value={quantity} onValueChange={setQuantity} required>
          <SelectTrigger className="form-select"><SelectValue /></SelectTrigger>
          <SelectContent>{["1", "2", "3", "4", "5"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      {product === "shirt" && shirtEdition === "edition-02" && (
        <label className="field field-color"><span>Cor *</span>
          <Select value={color} onValueChange={setColor} required>
            <SelectTrigger className="form-select"><SelectValue placeholder="Escolha a cor" /></SelectTrigger>
            <SelectContent>{["Off-white", "Roxa"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
          </Select>
        </label>
      )}
      <label className="field field-payment"><span>Forma de pagamento *</span>
        <Select value={pagamento} onValueChange={setPagamento} required>
          <SelectTrigger className="form-select"><SelectValue placeholder="Escolha uma forma" /></SelectTrigger>
          <SelectContent>{["PIX", "Cartão", "Dinheiro"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <TurnstileWidget action="shirt_order" onToken={handleToken} resetSignal={resetSignal} />
      <div className="form-confirm">
        <Checkbox id="pedido-confirmacao" checked={confirmed} onCheckedChange={(value) => setConfirmed(Boolean(value))} />
        <label htmlFor="pedido-confirmacao">Autorizo o contato da equipe sobre este pedido e li a <a href="/privacidade" target="_blank" rel="noreferrer">Política de Privacidade</a>.</label>
      </div>
      <div className="order-note"><MessageCircle /><span>PIX ou cartão abrem o checkout seguro do Mercado Pago. Dinheiro segue para confirmação pelo WhatsApp.</span></div>
      <button className="button button-orange" type="submit" disabled={!size || !pagamento || !turnstileToken || !confirmed || (product === "shirt" && shirtEdition === "edition-02" && !color) || sending}>
        {sending ? <><LoaderCircle className="spinner" /> Salvando...</> : <>Registrar e abrir WhatsApp <Send size={18} /></>}
      </button>
    </form>
  );
}
