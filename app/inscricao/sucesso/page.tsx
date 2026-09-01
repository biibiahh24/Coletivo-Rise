import type { Metadata } from "next";
import Link from "next/link";
import { ArrowLeft, CheckCircle2, MessageCircle, Sparkles } from "lucide-react";

export const metadata: Metadata = { title: "Inscrição recebida" };

export default function SucessoPage() {
  return (
    <main className="success-page">
      <section className="success-card">
        <div className="success-icon"><CheckCircle2 /></div>
        <span className="eyebrow"><Sparkles size={16} /> Tudo certo</span>
        <h1>Inscrição recebida!</h1>
        <p>A equipe do Coletivo Rise entrará em contato pelo WhatsApp com a confirmação e as próximas informações.</p>
        <div className="success-actions">
          <Link href="/" className="button button-dark"><ArrowLeft size={18} /> Voltar ao início</Link>
          <a href="https://wa.me/5511968778688" target="_blank" rel="noreferrer" className="button button-outline-dark"><MessageCircle size={18} /> Falar com a equipe</a>
        </div>
      </section>
    </main>
  );
}
