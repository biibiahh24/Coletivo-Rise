import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidade",
  description: "Saiba como o Coletivo Rise utiliza e protege os dados enviados pelo site.",
};

const whatsappHref = "https://wa.me/5511971590456";

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <section className="section-shell privacy-shell">
        <span className="eyebrow">Privacidade e cuidado</span>
        <h1>Seus dados merecem respeito.</h1>
        <p className="privacy-lead">Esta política explica, de forma clara, quais dados o Coletivo Rise trata, por que precisa deles, com quem pode compartilhá-los e como você pode exercer seus direitos.</p>
        <div className="privacy-content">
          <section><h2>Quem é responsável</h2><p>Controlador e responsável pelo atendimento: Coletivo Rise. Para solicitações sobre privacidade, use o WhatsApp oficial <a href={whatsappHref}>11 97159-0456</a>. A organização deve manter seus dados cadastrais e o contato do encarregado atualizados neste canal.</p></section>
          <section><h2>Quais dados coletamos</h2><p>Nas inscrições, podemos coletar nome, idade, responsável, telefone/WhatsApp, igreja, cidade/bairro, participação anterior, tamanho e cor da camiseta, forma de pagamento, presskit, comprovante, alergias, medicação, restrições alimentares e observações. Nos pedidos de camisetas, coletamos nome, telefone e dados do pedido. Também tratamos protocolo, versão da política, registros de consentimento, dados antifraude e registros técnicos necessários para segurança e prevenção de duplicidade.</p></section>
          <section><h2>Para que usamos</h2><p>Usamos os dados para organizar inscrições, verificar idade e autorização de responsáveis, preparar cuidados e alimentação, separar camisetas, confirmar pagamentos, emitir e consultar carnês, entregar pedidos, prevenir abusos e entrar em contato sobre a inscrição ou compra. O campo de observações não deve conter documentos, senhas ou informações sensíveis que não sejam necessárias para o evento.</p></section>
          <section><h2>Dados de saúde, religião e menores</h2><p>Alergias, medicação e restrições podem revelar dados de saúde. O campo de igreja pode revelar vínculo religioso. Esses dados são usados somente quando necessários ao cuidado e à organização, com acesso restrito à equipe autorizada. Participantes menores de idade devem informar um responsável; para crianças, a organização deve confirmar a autorização do responsável legal e observar o melhor interesse antes de concluir a inscrição.</p></section>
          <section><h2>Compartilhamento</h2><p>Não vendemos dados pessoais. Para operar o serviço, os dados estritamente necessários podem ser processados por Supabase (banco e armazenamento), Mercado Pago (pagamentos), Telegram (avisos à equipe), Vercel/Cloudflare (hospedagem e proteção antirrobô) e, quando habilitado pela organização, uma planilha operacional via Google Apps Script. Cada fornecedor deve receber somente os campos necessários à sua finalidade e estar sujeito a regras de segurança e confidencialidade.</p></section>
          <section><h2>Segurança</h2><p>O site valida os dados no servidor, utiliza autenticação e autorização no painel administrativo, políticas de acesso no banco, armazenamento privado de comprovantes, proteção antirrobô, limitação de tentativas, prevenção de duplicidade e registro de ações administrativas. Não coloque dados sensíveis no campo livre além do necessário para o cuidado.</p></section>
          <section><h2>Por quanto tempo guardamos</h2><p>Os registros são mantidos pelo período necessário para organizar o evento, concluir pedidos, conciliar pagamentos e cumprir obrigações administrativas. Comprovantes, cópias operacionais e logs devem ser eliminados ou anonimizados quando deixarem de ser necessários, respeitadas eventuais obrigações legais. Os prazos exatos de retenção devem ser definidos pela organização responsável e aplicados também às cópias e fornecedores.</p></section>
          <section><h2>Seus direitos e como pedir</h2><p>Você pode solicitar confirmação de tratamento, acesso, correção, informação sobre compartilhamentos, anonimização, bloqueio, eliminação, portabilidade quando aplicável e revogação do consentimento. Faça o pedido pelo <a href={whatsappHref}>WhatsApp oficial</a>, informe o protocolo ou telefone usado e não envie documentos desnecessários. A equipe poderá confirmar sua identidade para evitar acesso indevido. O pedido deve ser registrado e respondido conforme os prazos aplicáveis, inclusive a resposta completa em até 15 dias quando prevista no art. 19 da LGPD.</p></section>
          <section><h2>Incidentes de segurança</h2><p>Em caso de incidente com risco ou dano relevante, a organização deve conter o problema, preservar evidências, registrar a ocorrência e avaliar a comunicação à ANPD e às pessoas afetadas conforme a LGPD e as orientações da ANPD.</p></section>
        </div>
        <p className="privacy-update">Última atualização: novembro de 2026.</p>
      </section>
    </main>
  );
}
