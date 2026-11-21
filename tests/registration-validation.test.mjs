import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
import ts from 'typescript';
import assert from 'node:assert/strict';
import test from 'node:test';

// Execute the actual validator in isolation; no database or payment calls.
const require = createRequire(import.meta.url);
const source = readFileSync(new URL('../lib/submission-schema.ts', import.meta.url), 'utf8');
const compiled = ts.transpileModule(source, { compilerOptions: { module: ts.ModuleKind.CommonJS } }).outputText;
const module = { exports: {} };
new Function('require', 'module', 'exports', compiled)(require, module, module.exports);
const { submissionSchema } = module.exports;
const base = {
  kind: 'registration', idempotencyKey: '00000000-0000-4000-8000-000000000001',
  consent: true, privacyVersion: '2026-11', nome: 'Participante Teste', idade: 18,
  responsavel: '', telefone: '11999999999', igreja: 'Comunidade Teste', endereco: 'Cidade Teste',
  alergias: '', medicacao: '', restricao: '', participou: 'Não', inscricaoComCamiseta: 'Não',
  camiseta: '', corCamiseta: '', pagamento: 'PIX', presskit: 'Não', obs: '',
};
const cases = [
  ['adulto sem camiseta', {}, true],
  ['camiseta com tamanho e cor', { inscricaoComCamiseta: 'Sim', camiseta: 'M', corCamiseta: 'Roxa' }, true],
  ['camiseta sem tamanho', { inscricaoComCamiseta: 'Sim', corCamiseta: 'Roxa' }, false],
  ['camiseta sem cor', { inscricaoComCamiseta: 'Sim', camiseta: 'M' }, false],
  ['menor sem responsável', { idade: 17 }, false],
  ['menor com responsável', { idade: 17, responsavel: 'Responsável Teste' }, true],
  ['responsável só com espaços', { idade: 17, responsavel: '  ' }, false],
  ['idade abaixo de 10', { idade: 9 }, false],
  ['idade acima de 99', { idade: 100 }, false],
  ['idade fracionária', { idade: 17.5 }, false],
  ['nome vazio', { nome: '' }, false],
  ['nome só com espaços', { nome: '  ' }, false],
  ['igreja vazia', { igreja: '' }, false],
  ['cidade vazia', { endereco: '' }, false],
  ['telefone vazio', { telefone: '' }, false],
  ['telefone com letras', { telefone: 'abcdefghijk' }, false],
  ['telefone acima de 11 dígitos', { telefone: '119999999999' }, false],
  ['sem consentimento', { consent: false }, false],
  ['campo antispam preenchido', { website: 'spam' }, false],
  ['comprovante incompleto', { comprovanteBase64: 'YWJj' }, false],
  ['pagamento por cartão', { pagamento: 'Cartão' }, true],
  ['pagamento por carnê', { pagamento: 'Carnê' }, true],
  ['pagamento não permitido', { pagamento: 'Boleto' }, false],
  ['observação acima do limite', { obs: 'a'.repeat(1001) }, false],
];
for (const [name, changes, expected] of cases) {
  test(name, () => assert.equal(submissionSchema.safeParse({ ...base, ...changes }).success, expected));
}
