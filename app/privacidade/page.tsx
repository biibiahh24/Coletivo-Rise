import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Saiba como o Coletivo Rise utiliza e protege os dados enviados pelo site.",
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <section className="section-shell privacy-shell">
        <span className="eyebrow">Privacidade e cuidado</span>
        <h1>Seus dados merecem respeito.</h1>
        <p className="privacy-lead">Esta política explica como o Coletivo Rise trata as informações enviadas nos formulários de inscrição e pedidos.</p>

        <div className="privacy-content">
          <section><h2>Quais dados coletamos</h2><p>Nas inscrições, coletamos dados de identificação, contato, igreja, localização aproximada, informações necessárias de saúde, preferências, pagamento e, quando enviado, comprovante. Nos pedidos de camisetas, coletamos nome, telefone e dados do pedido.</p></section>
          <section><h2>Por que usamos esses dados</h2><p>Utilizamos as informações somente para organizar inscrições, preparar o cuidado durante o acampamento, confirmar pagamentos, administrar pedidos de camisetas e entrar em contato pelo WhatsApp.</p></section>
          <section><h2>Onde ficam armazenados</h2><p>Os registros são mantidos em banco de dados protegido. Quando enviados, os comprovantes ficam em armazenamento privado e são acessados somente por líderes autorizados. Uma planilha restrita pode receber uma cópia operacional com os campos necessários à organização.</p></section>
          <section><h2>Compartilhamento e proteção</h2><p>Não vendemos dados pessoais. O painel administrativo exige autenticação e autorização individual. O site utiliza validação no servidor, proteção antirrobô, limitação de tentativas e registro das ações administrativas.</p></section>
          <section><h2>Por quanto tempo guardamos</h2><p>Os dados serão mantidos somente pelo período necessário para organizar o evento ou pedido e cumprir obrigações administrativas. Depois disso, devem ser eliminados ou anonimizados com segurança.</p></section>
          <section><h2>Seus direitos</h2><p>Você pode solicitar confirmação, correção ou exclusão dos seus dados. Para isso, fale com a equipe pelo WhatsApp oficial do Coletivo Rise.</p></section>
        </div>
        <p className="privacy-update">Última atualização: outubro de 2026.</p>
      </section>
    </main>
  );
}
