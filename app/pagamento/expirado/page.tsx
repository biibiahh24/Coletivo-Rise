import Link from "next/link";

export default function PaymentExpiredPage() {
  return <main className="success-page"><section className="success-card"><span className="eyebrow">Checkout expirado</span><h1>Vamos tentar de novo?</h1><p>Esse checkout expirou após o período de segurança. Volte ao formulário para gerar um novo pagamento.</p><div className="success-actions"><Link href="/" className="button button-dark">Voltar ao início</Link><Link href="/inscricao" className="button button-outline-dark">Gerar novo checkout</Link></div></section></main>;
}
