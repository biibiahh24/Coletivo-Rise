import Link from "next/link";

export default function PaymentCanceledPage() {
  return <main className="success-page"><section className="success-card"><span className="eyebrow">Checkout cancelado</span><h1>Pagamento não concluído.</h1><p>Seu pedido continua registrado. Você pode voltar e tentar novamente ou falar com a equipe Rise.</p><div className="success-actions"><Link href="/" className="button button-dark">Voltar ao início</Link><Link href="/inscricao" className="button button-outline-dark">Tentar novamente</Link></div></section></main>;
}
