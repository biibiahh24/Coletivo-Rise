const REGISTRATION_HEADERS = ["Data", "Protocolo", "Nome", "Idade", "Responsável", "Telefone", "Igreja", "Cidade/Bairro", "Alergias", "Medicação", "Restrição alimentar", "Já participou", "Camiseta", "Pagamento", "Comprovante privado", "Observações", "Consentimento", "Versão da política", "Status", "Chave interna"];
const SHIRT_HEADERS = ["Data", "Protocolo", "Nome", "Telefone", "Modelo", "Tamanho", "Quantidade", "Pagamento", "Consentimento", "Versão da política", "Status", "Observações", "Chave interna"];

function setupRise() {
  const props = PropertiesService.getScriptProperties();
  const spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
  ensureSheet_(spreadsheet, "Inscrições Acampa", REGISTRATION_HEADERS);
  ensureSheet_(spreadsheet, "Pedidos Camisetas", SHIRT_HEADERS);
}

function doPost(e) {
  try {
    const props = PropertiesService.getScriptProperties();
    const data = JSON.parse(e.postData.contents || "{}");
    if (!data.sharedSecret || data.sharedSecret !== requiredProperty_(props, "RISE_SHARED_SECRET")) return json_({ ok: false, error: "unauthorized" });
    if (data.kind !== "registration" && data.kind !== "shirt") return json_({ ok: false, error: "invalid_kind" });

    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const spreadsheet = SpreadsheetApp.openById(requiredProperty_(props, "SPREADSHEET_ID"));
      const existingProtocol = findExistingProtocol_(spreadsheet, data.kind, data.idempotencyKey);
      if (existingProtocol) return json_({ ok: true, protocol: existingProtocol });
      const protocol = /^[A-Z]+-[0-9]{8}-[A-Z0-9]{8}$/.test(String(data.protocol || ""))
        ? String(data.protocol)
        : createProtocol_(data.kind);
      if (data.kind === "registration") appendRegistration_(spreadsheet, data, protocol);
      else appendShirtOrder_(spreadsheet, data, protocol);
      return json_({ ok: true, protocol: protocol });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    console.error("Rise integration error", error && error.message ? error.message : "unknown");
    return json_({ ok: false, error: "internal_error" });
  }
}

function appendRegistration_(spreadsheet, data, protocol) {
  const sheet = ensureSheet_(spreadsheet, "Inscrições Acampa", REGISTRATION_HEADERS);
  sheet.appendRow([new Date(), protocol, cell_(data.nome), Number(data.idade), cell_(data.responsavel), cell_(data.telefone), cell_(data.igreja), cell_(data.endereco), "Protegido no painel", "Protegido no painel", "Protegido no painel", cell_(data.participou), cell_(data.camiseta), cell_(data.pagamento), data.hasReceipt ? "Disponível no painel" : "Não enviado", "Consultar no painel", data.consent === true ? "Sim" : "Não", cell_(data.privacyVersion), "Recebida", data.idempotencyKey]);
}

function appendShirtOrder_(spreadsheet, data, protocol) {
  const sheet = ensureSheet_(spreadsheet, "Pedidos Camisetas", SHIRT_HEADERS);
  sheet.appendRow([new Date(), protocol, cell_(data.nome), cell_(data.telefone), cell_(data.edition), cell_(data.size), Number(data.quantity), cell_(data.pagamento), data.consent === true ? "Sim" : "Não", cell_(data.privacyVersion), "Novo", "", data.idempotencyKey]);
}

function ensureSheet_(spreadsheet, name, headers) {
  const sheet = spreadsheet.getSheetByName(name) || spreadsheet.insertSheet(name);
  if (sheet.getLastRow() === 0) {
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    sheet.setFrozenRows(1);
    sheet.hideColumns(headers.length);
  }
  return sheet;
}

function findExistingProtocol_(spreadsheet, kind, idempotencyKey) {
  if (!idempotencyKey) return "";
  const sheetName = kind === "registration" ? "Inscrições Acampa" : "Pedidos Camisetas";
  const sheet = spreadsheet.getSheetByName(sheetName);
  if (!sheet || sheet.getLastRow() < 2) return "";
  const keys = sheet.getRange(2, sheet.getLastColumn(), sheet.getLastRow() - 1, 1).getValues();
  for (let index = 0; index < keys.length; index++) {
    if (keys[index][0] === idempotencyKey) return String(sheet.getRange(index + 2, 2).getValue());
  }
  return "";
}

function createProtocol_(kind) {
  const prefix = kind === "registration" ? "ACAMPA" : "CAMISETA";
  return prefix + "-" + Utilities.formatDate(new Date(), Session.getScriptTimeZone(), "yyyyMMdd") + "-" + Utilities.getUuid().slice(0, 8).toUpperCase();
}

function cell_(value) {
  const text = String(value == null ? "" : value).trim();
  return /^[=+\-@]/.test(text) ? "'" + text : text;
}

function requiredProperty_(props, name) {
  const value = props.getProperty(name);
  if (!value) throw new Error("missing_" + name);
  return value;
}

function json_(value) {
  return ContentService.createTextOutput(JSON.stringify(value)).setMimeType(ContentService.MimeType.JSON);
}
