import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import assert from 'node:assert/strict';
import test from 'node:test';
const require = createRequire(import.meta.url);
function load(file, deps, env = {}, fetcher) {
  const code = ts.transpileModule(readFileSync(new URL('../' + file, import.meta.url), 'utf8'), { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
  const m = { exports: {} };
  new Function('require', 'module', 'exports', 'process', 'fetch', code)(id => deps[id] ?? require(id), m, m.exports, { env }, fetcher);
  return m.exports;
}
for (const [rank, shirt, expected] of [[1,false,400],[10,false,400],[11,false,450],[1,true,500],[11,true,500]]) {
  test(`checkout real isolado: posição ${rank}, camiseta ${shirt}, R$ ${expected}`, async () => {
    const db = { from: () => ({ select: () => ({ eq: () => ({ maybeSingle: async () => ({ data: { id: rank, notes: shirt ? 'Inscrição com camiseta — R$ 500,00.' : 'Inscrição sem camiseta.' } }) }), lte: async (_, id) => { assert.equal(id, rank); return { count: rank }; } }) }) };
    const pricing = load('lib/registration-price.ts', { '@/lib/supabase/admin': { createSupabaseAdminClient: () => db } });
    let sent;
    const route = load('app/api/mercadopago/checkout/route.ts', { '@/lib/registration-price': pricing, '@/lib/supabase/admin': { isSupabaseAdminConfigured: () => true } }, { MERCADOPAGO_ACCESS_TOKEN: 'test-only' }, async (url, options) => {
      assert.equal(url, 'https://api.mercadopago.com/checkout/preferences');
      sent = JSON.parse(options.body);
      return Response.json({ init_point: 'https://example.test/checkout' });
    });
    const response = await route.POST(new Request('https://example.test/api/mercadopago/checkout', { method: 'POST', body: JSON.stringify({ kind: 'registration', protocol: 'TEST-123456', pagamento: 'PIX', lote: 'primeiras', inscricaoComCamiseta: shirt ? 'Não' : 'Sim', presskit: 'Não' }) }));
    assert.equal(response.status, 200);
    assert.equal(sent.items[0].unit_price, expected);
    assert.equal(sent.external_reference, 'TEST-123456');
    assert.equal((await response.json()).checkoutUrl, 'https://example.test/checkout');
  });
}
