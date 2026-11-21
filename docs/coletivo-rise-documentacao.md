# Coletivo Rise — documentação do projeto

## Visão geral

O Coletivo Rise é uma plataforma digital responsiva criada para transformar a comunicação de um movimento de jovens em uma experiência web completa. O site reúne apresentação institucional, divulgação de encontros e células, inscrições para o Acampamento Rise, loja de camisetas, carnês de pagamento e uma área administrativa protegida.

O projeto foi desenvolvido para uso real, com foco em clareza da jornada do visitante, identidade visual própria, operação administrativa e integração com serviços externos.

- Site: https://coletivorise.vercel.app
- Repositório: https://github.com/biibiahh24/Coletivo-Rise
- Autores: Beatriz Ramos e Lucas Ojevan

## Objetivos

- Apresentar o Coletivo Rise e sua proposta de forma visual e acessível.
- Divulgar o Acampamento Rise e facilitar a inscrição dos participantes.
- Organizar modalidades de ingresso e opções de pagamento.
- Disponibilizar a coleção de camisetas com navegação visual, carrinho e checkout.
- Permitir consulta de carnês e pagamentos parciais.
- Centralizar inscrições e pedidos em uma área administrativa.
- Preservar segurança, privacidade e rastreabilidade operacional.

## Experiência e páginas públicas

### Página inicial (/)

Apresenta o posicionamento do Coletivo Rise, hero visual com fotos reais, navegação principal, chamadas para as experiências e conteúdos institucionais. A abertura da marca utiliza uma transição animada com a logo e a entrada progressiva da tipografia.

### Acampamento (/acampamento)

Página de divulgação do próximo Acampamento Rise, com chamada para a edição 2027, programação em abertura, adoração e envio, localização em Mogi das Cruzes — Bairro Varinhas, vagas limitadas, experiência de cinco dias, galeria de memórias com fotos reais e cards de ingresso, camiseta e kit completo.

### Células (/celulas)

Apresenta as comunidades e grupos do Coletivo Rise, com cartões visuais, informações de participação e identidade editorial consistente.

### Loja Rise (/loja)

Experiência de e-commerce com carrosséis de fotos, lightbox, visualização 3D, vídeos 3D por cor, carrinho com múltiplos itens, controle de quantidade, layout mobile, camiseta Geração disponível e modelos Roxa e Off-white marcados como “Em breve”.

### Inscrição (/inscricao)

Formulário dividido em etapas para dados pessoais, idade, responsável, contato, igreja, endereço, camiseta, cor, pagamento, presskit, observações e comprovante. Participantes menores de 18 anos precisam informar obrigatoriamente um responsável.

### Carnês (/carnes)

Área de consulta por telefone ou token, com plano, valor total, pagamentos aprovados, saldo, situação do carnê e pagamentos parciais.

### Retornos e privacidade

O projeto possui páginas de retorno para sucesso, pendência, cancelamento e expiração do pagamento, além da página pública /privacidade.

## Área administrativa

A área /admin é protegida por autenticação e autorização no servidor. O painel organiza os registros nas abas Inscrições, Acampamento, Acampamento + Presskit, Camisetas e Carnês.

O painel permite acompanhar status, consultar dados operacionais, atualizar registros autorizados e auditar ações. Comprovantes ficam em armazenamento privado e só podem ser acessados por administradores.

## Stack técnica

### Aplicação

- Next.js 16 com runtime Vinext;
- React 19;
- TypeScript 5.9;
- Vite;
- Tailwind CSS 4;
- Radix/shadcn e Lucide React;
- React Hook Form e Zod;
- Embla Carousel;
- CSS responsivo e tokens visuais próprios do Rise.

### Dados e backend

- Supabase para banco, autenticação e Storage privado;
- Supabase SSR para sessões no servidor;
- Drizzle ORM e migrations versionadas;
- rotas server-side para inscrições, pedidos e integrações;
- compatibilidade com Cloudflare Workers/D1/R2 em fluxos legados.

### Serviços integrados

- Mercado Pago para checkout e pagamentos;
- Telegram para notificações operacionais;
- Cloudflare Turnstile para proteção antirrobô;
- Google Apps Script opcional como cópia operacional;
- Vercel para publicação contínua;
- GitHub para versionamento.

## Modelo de dados

As principais entidades são camp_registrations, shirt_orders, carnet_plans, carnet_payments, submission_receipts, submission_attempts, admin_users e admin_audit_logs.

Cada inscrição ou pedido recebe um protocolo único. A chave de idempotência evita duplicidade quando o navegador repete uma requisição.

## Fluxo de inscrição

1. O visitante preenche o formulário em etapas.
2. O cliente envia os dados para /api/submissions.
3. O servidor valida o payload com Zod.
4. A origem da requisição é conferida.
5. Turnstile é validado quando configurado.
6. O rate limit é aplicado por fingerprint protegido.
7. A idempotência é consultada.
8. A inscrição é gravada no Supabase.
9. O comprovante é armazenado de forma privada quando enviado.
10. Um protocolo é devolvido ao usuário.
11. Telegram e a integração operacional recebem uma notificação, quando configurados.

## Pagamentos

O provedor utilizado é o Mercado Pago. O sistema mantém os estados de pagamento separados dos estados operacionais da inscrição e do pedido.

Credenciais de produção devem existir somente no provedor de hospedagem. Testes locais devem usar sandbox ou fluxos que não gerem cobrança real.

## Segurança e privacidade

- validação de entrada no servidor;
- autorização administrativa por identidade permitida;
- RLS no Supabase;
- Storage privado para comprovantes;
- chaves privilegiadas restritas ao servidor;
- verificação de origem;
- Turnstile contra automação abusiva;
- rate limit de tentativas;
- proteção contra reenvio por idempotência;
- limite de tamanho e validação de MIME e magic bytes;
- normalização de telefone;
- respostas sem exposição de tokens;
- auditoria de ações administrativas.

Nenhum token, senha, chave privada ou variável real deve ser commitado no repositório.

## Responsividade e acessibilidade

O layout foi construído para desktop e mobile, com navegação adaptada, carrinho responsivo, formulários em etapas, controles de quantidade acessíveis, nomes descritivos para botões e links, contraste baseado na identidade visual e galerias adaptadas para toque.

## Organização do código

- app: rotas, páginas e API routes;
- app/components: componentes de interface;
- components/ui: componentes visuais reutilizáveis;
- lib: validações, autenticação, Supabase, Telegram, carnês e rate limit;
- supabase/migrations: evolução versionada do banco;
- public/assets: fotos, logos, vídeos e materiais;
- tests: testes de HTML e componentes;
- scripts: automações de build;
- tokens: tokens visuais.

## Execução local

Requisitos: Node.js 22.13 ou superior, npm, Git e .env.local configurado a partir de .env.example.

    git clone https://github.com/biibiahh24/Coletivo-Rise.git
    cd Coletivo-Rise
    npm install
    npm run dev

Aplicação local: http://localhost:5173.

## Variáveis de ambiente

Os nomes esperados estão documentados em .env.example:

- NEXT_PUBLIC_SUPABASE_URL;
- NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY;
- SUPABASE_SECRET_KEY ou SUPABASE_SERVICE_ROLE_KEY;
- ADMIN_EMAILS;
- RATE_LIMIT_SALT;
- TURNSTILE_SITE_KEY e TURNSTILE_SECRET_KEY;
- MERCADOPAGO_ACCESS_TOKEN e MERCADOPAGO_ENV;
- TELEGRAM_BOT_TOKEN e TELEGRAM_CHAT_ID;
- variáveis opcionais do Google Apps Script.

Chaves server-only nunca devem ser importadas por componentes client-side.

## Testes e qualidade

    npx tsc --noEmit
    npm run lint
    node --test tests/rendered-html.test.mjs
    node --test tests/ui-components.test.mjs
    npm run build
    npm run security:audit

Antes de publicar, validar visualmente os fluxos de navegação, inscrição, carrinho, consulta de carnê e acesso administrativo sem executar cobranças reais.

## Deploy e operação

O fluxo oficial usa a branch main:

    git status
    git add <arquivos-alterados>
    git commit -m "mensagem da alteração"
    git push origin main

O push aciona o deploy automático da Vercel. Alterações em produção devem ser acompanhadas de validação HTTP, inspeção visual e verificação dos logs da implantação.

## Texto curto para portfólio

> Desenvolvemos o Coletivo Rise, uma plataforma web responsiva para comunicação, inscrições e vendas de um movimento de jovens. O projeto combina experiência visual autoral, formulários em etapas, loja com carrinho, checkout Mercado Pago, carnês com pagamentos parciais, notificações via Telegram e painel administrativo protegido. A solução foi construída com Next.js/Vinext, React, TypeScript, Supabase, Zod, Drizzle ORM e Vercel, com foco em segurança, operação real e experiência mobile.

## Texto comercial para página de cases

### Coletivo Rise: uma experiência digital para uma comunidade em movimento

O desafio era criar uma presença digital que fosse mais do que uma página institucional. O Coletivo Rise precisava comunicar sua identidade, divulgar encontros, receber inscrições, organizar pagamentos e apresentar uma coleção de produtos em uma única experiência.

Construímos uma plataforma completa, responsiva e preparada para operação real. A navegação conecta conteúdo, comunidade, inscrição e loja; o back-end valida os dados no servidor; o painel administrativo organiza os registros; e as integrações com Mercado Pago, Telegram e Supabase sustentam o fluxo operacional.

O resultado é um site com personalidade de marca, jornada clara para o usuário e estrutura técnica preparada para evoluir junto com o Coletivo Rise.

## Créditos

Projeto desenvolvido por **Beatriz Ramos** e **Lucas Ojevan** para o **Coletivo Rise**.

- GitHub: https://github.com/LucasOjevan
- Instagram: https://www.instagram.com/coletivo_rise/
- Site: https://coletivorise.vercel.app
