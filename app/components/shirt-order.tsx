"use client";

import { useState } from "react";
import { MessageCircle, Send } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export function ShirtOrder() {
  const [edition, setEdition] = useState("");
  const [size, setSize] = useState("");
  const [quantity, setQuantity] = useState("1");

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!edition || !size) return;
    const data = new FormData(event.currentTarget);
    const message = [
      "Olá, equipe Rise! Quero fazer um pedido de camiseta.",
      `Nome: ${String(data.get("nome") ?? "")}`,
      `Modelo: ${edition}`,
      `Tamanho: ${size}`,
      `Quantidade: ${quantity}`,
      "Podem me confirmar a disponibilidade e o pagamento?"
    ].join("\n");
    window.open(`https://wa.me/5511968778688?text=${encodeURIComponent(message)}`, "_blank", "noopener,noreferrer");
  }

  return (
    <form className="shirt-order" onSubmit={handleSubmit}>
      <label className="field"><span>Seu nome *</span><Input name="nome" required placeholder="Como podemos te chamar?" /></label>
      <label className="field"><span>Modelo *</span>
        <Select value={edition} onValueChange={setEdition} required>
          <SelectTrigger className="form-select"><SelectValue placeholder="Escolha uma edição" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="Camiseta Rise — Edição 01">Edição 01</SelectItem>
            <SelectItem value="Camiseta Rise — Edição 02">Edição 02</SelectItem>
            <SelectItem value="Camiseta Rise — Edição 03">Edição 03</SelectItem>
          </SelectContent>
        </Select>
      </label>
      <label className="field"><span>Tamanho *</span>
        <Select value={size} onValueChange={setSize} required>
          <SelectTrigger className="form-select"><SelectValue placeholder="Escolha o tamanho" /></SelectTrigger>
          <SelectContent>{["P", "M", "G", "GG"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <label className="field"><span>Quantidade *</span>
        <Select value={quantity} onValueChange={setQuantity} required>
          <SelectTrigger className="form-select"><SelectValue /></SelectTrigger>
          <SelectContent>{["1", "2", "3", "4", "5"].map((item) => <SelectItem value={item} key={item}>{item}</SelectItem>)}</SelectContent>
        </Select>
      </label>
      <div className="order-note"><MessageCircle /><span>O WhatsApp abrirá com o pedido organizado. Você confere e toca em enviar.</span></div>
      <button className="button button-orange" type="submit" disabled={!edition || !size}>Enviar pedido <Send size={18} /></button>
    </form>
  );
}
