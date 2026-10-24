import Link from "next/link";

export default function PaymentPendingPage() {
  return <main className="success-page"><section className="success-card"><span className="eyebrow">Pagamento pendente</span><h1>Quase lá!</h1><p>O Mercado Pago ainda está processando seu pagamento. A confirmação será atualizada automaticamente.</p><div className="success-actions"><Link href="/" className="button button-dark">Voltar ao início</Link></div></section></main>;
}
