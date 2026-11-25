# Contexto de transferência — Coletivo Rise

Use este documento como contexto inicial ao continuar o projeto em outro site, agente ou ambiente de desenvolvimento.

## Identificação do projeto

- Projeto: **Coletivo Rise**
- Repositório GitHub: <https://github.com/biibiahh24/Coletivo-Rise>
- Site publicado: <https://coletivorise.vercel.app>
- Projeto Vercel: <https://vercel.com/oliverrbiahh10-4202/coletivorise>
- Branch principal: `main`
- Versão registrada no `package.json`: `9.0.0`
- Caminho local conhecido: `C:\Users\lucas\Documents\Codex\2026-10-29\estou-trabalhando-no-site-coletivo-rise\work\Coletivo-Rise`
- Autores: **Beatriz Ramos** e **Lucas Ojevan**
- GitHub do Lucas: <https://github.com/LucasOjevan>

## Instruções obrigatórias

1. Responder sempre em português do Brasil.
2. Preservar alterações existentes e manter o escopo solicitado.
3. Nunca alterar tokens, variáveis de ambiente, chaves, dados reais do Supabase ou credenciais.
4. Nunca realizar cobranças reais. Testes de Mercado Pago devem usar sandbox ou parar antes da confirmação da cobrança.
5. Não excluir deploys da Vercel sem autorização explícita. Deploys de 28/10/2026 em diante devem ser preservados; se houver autorização para excluir, considerar somente deploys de 27/10/2026 ou anteriores e conferir cada data individualmente.
6. Não fazer `git push`, deploy, release ou outra alteração externa sem pedido explícito do usuário.
7. Antes e depois de alterações, validar o comportamento. Para mudanças de aplicação, executar TypeScript, lint, testes e build quando aplicável.
8. Não publicar `.env`, tokens, senhas, dados pessoais de teste ou dados do Supabase.

## Stack e execução

- Next.js/Vinext, React, TypeScript e Vite.
- Supabase para banco, autenticação e armazenamento.
- Drizzle ORM e Zod.
- Mercado Pago para pagamentos.
- Telegram para notificações.
- CSS responsivo, Lucide React e componentes React.
- Vercel para deploy automático a partir de `main`.
- Node.js `22.13.0` ou superior.

Comandos principais:

```bash
npm install
npm run dev
npx tsc --noEmit
npm run lint
node --test tests/rendered-html.test.mjs
npm test
npm run build
npm run security:audit
```

URLs locais usuais:

- Site: `http://localhost:5173/`
- Loja: `http://localhost:5173/loja`
- Inscrição: `http://localhost:5173/inscricao`
- Administração: `http://localhost:5173/admin`

## Funcionalidades implementadas

### Site e navegação

- Página inicial responsiva com hero/carrossel e abertura animada da marca.
- Logo Rise, transição suave e letras entrando em sequência.
- Faixa/mensagem animada responsiva.
- Menu mobile, rodapé, botão de WhatsApp e páginas de privacidade.
- WhatsApp configurado para o número `11 97159-0456` (link internacional `5511971590456`).

### Acampamento e inscrições

- Página de acampamento com local **Mogi das Cruzes — Bairro Varinhas**.
- Informações de vagas, ambiente, calendário e duração de 5 dias.
- Galeria/carrosséis com fotos reais do acampamento.
- Formulário de inscrição em etapas, incluindo dados pessoais, saúde, preferências e pagamento.
- Regra para menores: participante menor de 18 anos precisa informar responsável/autorização.
- Campo de telefone com limite de 11 caracteres.
- Política de privacidade e consentimento no formulário.
- Opção de inscrição com pagamento posterior ou pagamento imediato.
- O presskit inclui camiseta automaticamente; não duplicar camiseta no cálculo.
- Fluxo de inscrição abre a partir da aba **Acampamento**.

Valores definidos pelo produto:

- 10 primeiras inscrições: R$ 400,00, somente quando houver pagamento/sinal elegível acima de R$ 50,00; sem pagamento, a inscrição deve seguir para R$ 450,00.
- Demais inscrições (ingresso): R$ 450,00.
- Ingresso com camiseta: R$ 500,00.
- Presskit: R$ 550,00, já com camiseta incluída.

Regra de negócio das 10 primeiras vagas: a pessoa pode se inscrever e pagar depois, mas a condição de R$ 400,00 somente é garantida quando houver pagamento instantâneo/sinal superior a R$ 50,00 e ainda houver vaga promocional disponível. Caso contrário, deve ser aplicado o lote normal de R$ 450,00. O preço deve ser calculado no servidor/banco, nunca confiando no valor enviado pelo navegador.

### Loja

- Loja Rise com carrosséis de camisetas, fotos arredondadas e ampliáveis.
- Carrinho com múltiplos itens, quantidade, remoção e adaptação para mobile.
- Camiseta Geração disponível para compra.
- Modelos Roxa e Off-white devem aparecer como **Em breve** quando essa regra estiver ativa; quando liberados, o preço de cada camiseta Rise é R$ 50,00.
- Presskit da loja disponível para compra por R$ 100,00.
- Botão “Veja 3D” relacionado à cor/modelo correto: cada cor pode ter seu próprio vídeo 3D.
- Pedidos de camiseta e presskit devem ser encaminhados para o WhatsApp, sem cobrança automática no Mercado Pago.
- Carrinho deve ficar oculto quando popup de imagem, vídeo ou checkout estiver aberto.

### Pagamentos e notificações

- Mercado Pago é o gateway de pagamento; não usar Asaas.
- Inscrições podem ir ao Mercado Pago quando o usuário escolher pagar agora.
- Camisetas/presskit da loja vão para o WhatsApp conforme a regra do produto.
- Telegram é usado para notificações administrativas.
- Nunca concluir cobrança real durante testes.

### Administração

- Área administrativa protegida para inscrições, pagamentos, carnês, camisetas e presskit.
- Aba **Inscrições** deve listar inscrições independentemente da forma de pagamento e do tipo de ingresso.
- Admin pode registrar pagamento individual por inscrição, informando valor, método e observação.
- O valor pago deve ser acumulado por eventos de auditoria e refletido no status (`partial`/`paid`).
- Endpoint implementado: `app/api/admin/registration-payments/route.ts`.
- O endpoint valida autenticação, origem, payload e calcula o total pelo protocolo/servidor.

### Consulta pública da inscrição

- O menu desktop e mobile possui a aba **Minha inscrição**, semelhante a **Meus Carnês**.
- A pessoa informa o telefone usado no cadastro para consultar o andamento da inscrição.
- A consulta aplica rate limit, busca pelo telefone normalizado no servidor e redireciona para `/inscricao/consulta` usando token HMAC temporário.
- A tela mostra status da inscrição, status/método de pagamento e se o ingresso tem camiseta ou presskit, sem expor o telefone.
- Arquivos: `app/components/registration-lookup-modal.tsx`, `app/components/registration-lookup-portal.tsx`, `app/api/inscricoes/lookup/route.ts`, `app/api/inscricoes/[token]/route.ts`.

## Arquivos e áreas principais

- `app/components/shirt-order.tsx` — loja, produto, carrinho e checkout de camisetas.
- `app/components/site-chrome.tsx` — navegação, rodapé e links globais.
- `app/globals.css` — tokens e estilos responsivos.
- `app/admin/page.tsx` — painel administrativo e consolidação de pagamentos.
- `app/admin/admin-actions.tsx` — ações e modal de adicionar pagamento.
- `app/api/admin/registration-payments/route.ts` — registro seguro de pagamentos administrativos.
- `app/` — páginas, componentes e rotas da aplicação.
- `public/assets/` — fotos, logos e vídeos públicos.
- `tests/rendered-html.test.mjs` — testes de HTML renderizado e contratos principais.
- `docs/coletivo-rise-documentacao.md` — documentação geral do site.
- `docs/privacy-requests.md` — fluxo de solicitações de privacidade.
- `docs/incident-response.md` — resposta a incidentes.
- `README.md` — instalação, stack, segurança e publicação.

## Validações conhecidas

Na última implementação do registro de pagamentos administrativos foram executados com sucesso:

- `npx tsc --noEmit`
- ESLint dos arquivos alterados
- `npm test`
- Build de produção
- 49 testes automatizados aprovados, 0 falhas

O ambiente local pode funcionar em modo de demonstração quando as variáveis do Supabase não estão configuradas. Nesse caso, o painel mostra exemplos e uma inscrição pode não persistir. Isso deve ser reportado como limitação do ambiente, sem inserir dados fictícios no banco real.

## Tarefa em andamento na transferência

Há uma tentativa de inscrição local de teste preparada no navegador em `http://127.0.0.1:5173/inscricao`, usando dados fictícios:

- Nome: `Participante Teste Local`
- Idade: `25`
- Telefone: `11999990000`
- Igreja: `Igreja Teste`
- Cidade/bairro: `Mogi das Cruzes`
- Já participou: não
- Camiseta: não
- Presskit: não
- Pagamento: carnê/pagar depois

O formulário está aguardando confirmação do usuário antes do clique final em **“Enviar inscrição e pagar depois”**. Não clicar nem enviar sem confirmação explícita, pois esse clique cria um registro local.

## Como publicar

Somente quando o usuário pedir explicitamente:

```bash
git status
git add <arquivos-alterados>
git commit -m "mensagem clara da alteração"
git push origin main
```

Após o push, aguardar o deploy automático da Vercel e verificar pelo menos:

- `https://coletivorise.vercel.app/`
- `https://coletivorise.vercel.app/loja`
- `https://coletivorise.vercel.app/inscricao`

Não excluir deploys antigos nem alterar produção sem autorização.

## Segurança e LGPD

- Não expor chaves de API, tokens, senhas, cookies, comprovantes ou dados pessoais em código, logs, commits ou respostas.
- Validar entradas no servidor e aplicar autorização por recurso/ação.
- Não confiar em preço, método, protocolo ou status enviado pelo cliente.
- Não fazer testes reais de cobrança.
- Revisões de privacidade são técnicas e não substituem orientação jurídica.

## Diretriz para o próximo agente/site

Antes de alterar qualquer coisa: leia este arquivo, o `README.md`, o `AGENTS.md` aplicável e o estado do Git; preserve mudanças existentes; faça alterações focadas; valide localmente; e só faça push/deploy quando o usuário solicitar explicitamente.
