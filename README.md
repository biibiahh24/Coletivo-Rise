# Coletivo Rise

Site oficial do Coletivo Rise: uma experiência para apresentar o movimento, divulgar encontros e células, receber inscrições e oferecer a coleção de camisetas.

> “Levanta-te, resplandece, porque já vem a tua luz.” — Isaías 60:1

## O que o projeto oferece

- Página inicial responsiva com hero rotativo e abertura animada da marca;
- Páginas de acampamento, células, loja e privacidade;
- Galerias de fotos, vídeos de adoração e carrosséis de camisetas;
- Inscrição em etapas para o Acampamento Rise;
- Loja Rise com carrinho, controle de quantidade e checkout;
- Camiseta Geração disponível para compra; modelos Roxa e Off-white sinalizados como “Em breve”;
- Checkout e notificações integrados ao Mercado Pago, Asaas e Telegram;
- Carnês consultáveis por telefone e pagamentos parciais;
- Área administrativa protegida para acompanhar inscrições e registros;
- Validação no servidor, proteção antirrobô e controle de tentativas.

## Stack

- Next.js/Vinext, React, TypeScript e Vite;
- Supabase para banco, autenticação e armazenamento;
- Drizzle ORM e Zod;
- Mercado Pago e Asaas para pagamentos;
- Telegram para notificações;
- CSS responsivo e componentes com Lucide React;
- Vercel para publicação contínua a partir da branch `main`.

## Executar localmente

### Requisitos

- Node.js `22.13.0` ou superior;
- npm;
- Git.

```bash
git clone https://github.com/biibiahh24/Coletivo-Rise.git
cd Coletivo-Rise
npm install
npm run dev
```

Abra `http://localhost:5173` no navegador. O painel local fica em `http://localhost:5173/admin`.

## Variáveis de ambiente

Crie `.env.local` a partir de `.env.example`. Nunca publique esse arquivo nem tokens reais.

Principais grupos de configuração:

- `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY`;
- `SUPABASE_SECRET_KEY` ou `SUPABASE_SERVICE_ROLE_KEY` (somente servidor);
- `ADMIN_EMAILS`, `RATE_LIMIT_SALT` e chaves do Turnstile;
- `TELEGRAM_BOT_TOKEN` e `TELEGRAM_CHAT_ID`;
- `MERCADOPAGO_ACCESS_TOKEN` e `MERCADOPAGO_ENV`;
- `ASAAS_API_KEY`, `ASAAS_ENV` e `ASAAS_WEBHOOK_TOKEN`;
- integração opcional com Google Apps Script.

## Comandos úteis

```bash
npm run dev             # servidor local
npm run build           # build de produção
npm run start           # inicia o build
npm test                # build e testes automatizados
npm run lint            # ESLint do projeto
npm run security:audit  # auditoria de dependências de produção
```

Antes de publicar alterações de interface ou integrações, também é recomendado executar:

```bash
npx tsc --noEmit
node --test tests/rendered-html.test.mjs
```

## Publicação

O fluxo oficial usa a branch `main`:

```bash
git add <arquivos>
git commit -m "mensagem da alteração"
git push origin main
```

O push aciona o deploy automático da Vercel. O site publicado está em [coletivorise.vercel.app](https://coletivorise.vercel.app).

## Segurança e privacidade

Não faça cobranças reais durante testes. Use os ambientes de sandbox quando disponíveis e mantenha chaves, tokens, dados do Supabase e comprovantes fora do Git. A autorização administrativa e o processamento de pagamentos devem ocorrer no servidor.

## Contato

- Instagram: [@coletivo_rise](https://www.instagram.com/coletivo_rise/)
- Site: [coletivorise.vercel.app](https://coletivorise.vercel.app)

Projeto desenvolvido por **Beatriz Ramos** para o **Coletivo Rise**.
