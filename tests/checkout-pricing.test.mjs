import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { test } from "node:test";

const root = new URL("..", import.meta.url);
const read = (path) => readFile(new URL(path, root), "utf8");

test("checkout de camiseta aceita as edições usadas pelo formulário e usa R$ 49,99", async () => {
  const schema = await read("lib/submission-schema.ts");
  const checkout = await read("app/api/mercadopago/checkout/route.ts");
  const form = await read("app/components/shirt-order.tsx");

  for (const edition of ["Camiseta Rise — Levanta-te Off-white", "Camiseta Rise — Levanta-te Roxa", "Camiseta Rise — Geração que se levanta"]) {
    assert.match(schema, new RegExp(edition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
    assert.match(checkout, new RegExp(edition.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")));
  }
  assert.match(form, /edition: cartItem\.edition/);
  assert.match(checkout, /unit_price: data\.product === "presskit" \? 119\.9 : 49\.99/);
  assert.doesNotMatch(checkout, /unit_price: data\.product === "presskit" \? 119\.9 : 149/);
});

test("checkout de inscrição mantém os dois preços de lote", async () => {
  const checkout = await read("app/api/mercadopago/checkout/route.ts");
  assert.match(checkout, /data\.lote === "primeiras" \? 400 : 450/);
  assert.match(checkout, /registrationPrice === 400 \? "1º lote" : "próximas vagas"/);
});

test("camisetas não são encaminhadas ao Mercado Pago", async () => {
  const form = await read("app/components/shirt-order.tsx");
  const checkout = await read("app/api/mercadopago/checkout/route.ts");
  assert.doesNotMatch(form, /fetch\("\/api\/mercadopago\/checkout"/);
  assert.match(form, /https:\/\/wa\.me\//);
  assert.match(checkout, /data\.kind === "shirt"\) return reply\(\{ error: "Pedidos de camisetas são confirmados pelo WhatsApp\." \}, 409\)/);
});

test("checkout de carnê usa o valor validado no servidor", async () => {
  const checkout = await read("app/api/carnes/checkout/route.ts");
  assert.match(checkout, /unit_price: parsed\.data\.amountCents \/ 100/);
  assert.match(checkout, /parsed\.data\.amountCents < minimum/);
  assert.match(checkout, /parsed\.data\.amountCents > remaining/);
});
