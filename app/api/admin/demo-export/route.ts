function csvCell(value: string | number) {
  let text = String(value);
  if (/^[=+\-@\t\r]/.test(text)) text = `'${text}`;
  return `"${text.replaceAll('"', '""')}"`;
}

function localDevelopment(request: Request) {
  const host = (request.headers.get("x-forwarded-host") ?? request.headers.get("host") ?? "")
    .split(",")[0]
    .trim()
    .split(":")[0];
  return process.env.NODE_ENV !== "production" && (host === "localhost" || host === "127.0.0.1" || host === "[::1]" || host === "terminal.local");
}

export async function GET(request: Request) {
  if (!localDevelopment(request)) {
    return Response.json({ error: "Não encontrado." }, { status: 404 });
  }

  const kind = new URL(request.url).searchParams.get("kind") === "shirt" ? "shirt" : "registration";
  const headers = kind === "registration"
    ? ["Protocolo", "Nome", "Idade", "Telefone", "Igreja", "Localidade", "Camiseta", "Pagamento", "Situação", "Data"]
    : ["Protocolo", "Nome", "Telefone", "Coleção", "Tamanho", "Quantidade", "Pagamento", "Situação", "Data"];
  const rows: Array<Array<string | number>> = kind === "registration"
    ? [
        ["RISE-2027-0001", "Mariana Oliveira", 18, "(11) 99999-0001", "Igreja da Família", "São Paulo — SP", "M", "Pago", "Confirmada", "18/10/2026 23:00"],
        ["RISE-2027-0002", "Lucas Santos", 16, "(11) 99999-0002", "Comunidade da Graça", "Guarulhos — SP", "G", "Pendente", "Pendente", "19/10/2026 23:00"],
      ]
    : [
        ["LOJA-2026-0001", "Beatriz Ramos", "(11) 99999-0003", "Brasil pertence a Jesus", "M", 1, "Pago", "Separado", "19/10/2026 00:00"],
      ];
  const csv = [headers, ...rows].map((row) => row.map(csvCell).join(";")).join("\r\n");
  const filename = kind === "registration" ? "inscricoes-rise-demonstracao.csv" : "pedidos-rise-demonstracao.csv";

  return new Response(`\uFEFF${csv}`, {
    headers: {
      "Cache-Control": "no-store",
      "Content-Disposition": `attachment; filename="${filename}"`,
      "Content-Type": "text/csv; charset=utf-8",
    },
  });
}
