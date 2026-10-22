# Coletivo Rise — Site Oficial

Site oficial do **Coletivo Rise**, criado para apresentar o movimento, divulgar encontros e células, organizar o Acampamento Rise 2027 e receber pedidos das coleções de camisetas.

> **“Levanta-te, resplandece, porque já vem a tua luz.” — Isaías 60:1**

## Recursos

- Página inicial responsiva com destaques rotativos;
- Páginas de células, acampamento, loja e privacidade;
- Fotografias e vídeos reais do coletivo;
- Inscrição do Acampamento Rise 2027;
- Pedidos de camisetas com confirmação pelo WhatsApp;
- Proteção antirrobô, controle de tentativas e validação no servidor;
- Banco de dados para inscrições e pedidos;
- Armazenamento privado de comprovantes;
- Painel administrativo protegido em `/admin`;
- Busca, filtros, atualização de status e exportação CSV;
- Registro de alterações realizadas pela equipe;
- Sincronização opcional com Google Sheets.

## Tecnologias

- **TypeScript e JavaScript**
- **React e Next.js**
- **Vinext e Vite**
- **Cloudflare Workers, D1, R2 e Turnstile**
- **Drizzle ORM e SQLite**
- **Zod**
- **HTML e CSS**
- **Google Apps Script**, opcional
- **Git e GitHub**

## Como executar localmente

### Pré-requisitos

- Node.js `22.13.0` ou superior;
- npm;
- Git.

Clone o repositório, entre na pasta e instale as dependências:

```bash
git clone https://github.com/biibiahh24/Coletivo-Rise.git
cd Coletivo-Rise
npm install
```

Inicie o ambiente local:

```bash
npm run dev
```

Se estiver usando uma versão anterior no Windows e o comando acima apresentar erro com `WRANGLER_LOG_PATH`, utilize:

```bash
npx vite
```

Abra o endereço apresentado no terminal, normalmente `http://localhost:5173`.

O painel pode ser visualizado localmente em `http://localhost:5173/admin`. No ambiente local ele abre automaticamente em modo de demonstração, com dados fictícios e sem permitir alterações. A autenticação real, o banco e os recursos administrativos completos são habilitados somente no site hospedado.

## Configuração segura

Crie um arquivo `.env.local` somente no computador, utilizando `.env.example` como referência:

```env
TURNSTILE_SITE_KEY=
TURNSTILE_SECRET_KEY=
ADMIN_EMAILS=
RATE_LIMIT_SALT=
GOOGLE_APPS_SCRIPT_URL=
GOOGLE_APPS_SCRIPT_SECRET=
```

- `TURNSTILE_SITE_KEY` e `TURNSTILE_SECRET_KEY`: proteção dos formulários;
- `ADMIN_EMAILS`: e-mails autorizados no painel, separados por vírgula;
- `RATE_LIMIT_SALT`: valor aleatório usado no controle de tentativas;
- chaves do Google Apps Script: opcionais, usadas somente para a cópia operacional em planilha.

Nunca envie `.env.local`, senhas, tokens ou chaves privadas ao GitHub.

## Dados e privacidade

O banco D1 é a fonte oficial das inscrições e dos pedidos. Os comprovantes ficam no armazenamento privado R2 e são entregues apenas após autenticação e autorização no painel. A exportação CSV também exige acesso administrativo e fica registrada na auditoria.

O WhatsApp recebe somente o protocolo e o resumo necessário para a confirmação. Informações de saúde não são incluídas na mensagem.

## Versões

- `v1.0.0`: primeira versão oficial do projeto, correspondente à fase interna V4;
- `v6.0.0`: fotografias reais, vídeos, coleção e Acampamento Rise 2027;
- **V8:** melhorias de responsividade e apresentação;
- **V9 em preparação:** banco de dados, painel administrativo, CSV e segurança dos formulários.

As versões publicadas podem ser consultadas na área de **Releases** do GitHub.

## Contato

- Instagram: [**@coletivo_rise**](https://www.instagram.com/coletivo_rise/)
- WhatsApp: disponível pelos botões oficiais do site.

## Autoria

Projeto desenvolvido por **Beatriz Ramos** para o **Coletivo Rise**.

---

**Rise — uma geração em movimento.**
