import Link from "next/link";
import { CheckCircle2, MessageCircle } from "lucide-react";

export default function PaymentSuccessPage() {
  return <main className="success-page"><section className="success-card"><div className="success-icon"><CheckCircle2 /></div><span className="eyebrow">Pagamento enviado</span><h1>Obrigado!</h1><p>Recebemos o retorno do checkout. A confirmação financeira será atualizada automaticamente pelo Mercado Pago.</p><div className="success-actions"><Link href="/" className="button button-dark">Voltar ao início</Link><a href="https://wa.me/5511968778688" target="_blank" rel="noreferrer" className="button button-outline-dark"><MessageCircle size={18} /> Falar com a equipe</a></div></section></main>;
}
