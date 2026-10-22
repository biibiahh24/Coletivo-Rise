# Cópia operacional opcional no Google Sheets

O banco D1 é a fonte oficial. Esta integração é opcional e envia à planilha apenas os dados operacionais necessários à organização, sem informações de saúde e sem o arquivo do comprovante.

1. Crie uma planilha Google vazia e mantenha o acesso restrito à equipe autorizada.
2. Na planilha, abra **Extensões > Apps Script** e cole o conteúdo de `Code.gs`.
3. Em **Configurações do projeto > Propriedades do script**, crie:
   - `SPREADSHEET_ID`: trecho da URL da planilha entre `/d/` e `/edit`;
   - `RISE_SHARED_SECRET`: segredo aleatório longo, diferente das outras chaves.
4. Execute `setupRise` uma vez e autorize o acesso. As duas abas serão criadas.
5. Use **Implantar > Nova implantação > Aplicativo da Web**. Execute como o proprietário e copie a URL terminada em `/exec`.
6. No ambiente seguro do site, cadastre a URL como `GOOGLE_APPS_SCRIPT_URL` e o mesmo segredo como `GOOGLE_APPS_SCRIPT_SECRET`.
7. Se a planilha estiver indisponível, a inscrição continuará preservada no banco; a equipe poderá exportar um novo CSV pelo painel.

Nunca coloque segredos em arquivos enviados ao GitHub, mensagens, código do navegador ou planilhas.
