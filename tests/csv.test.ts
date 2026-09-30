import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, exportCsv } from '../lib/csv.ts';

test('CSV preserves quoted delimiters, accents, multiline values and escaped quotes', () => {
  const rows = [['João; Silva', 'Texto\ncom "aspas"'], ['Maria', '']];
  assert.deepEqual(parseCsv(exportCsv(['nome', 'nota'], rows)), [['nome', 'nota'], ...rows]);
});
test('CSV rejects malformed input and excessive records', () => {
  for (const input of ['a;b\n1', 'a\n"ab', 'a\n"x"z', 'a\n' + 'x\n'.repeat(501)]) assert.throws(() => parseCsv(input));
});
test('Export neutralizes formulas including whitespace prefixes', () => {
  const result = parseCsv(exportCsv(['valor'], [['=cmd()'], ['  +cmd()'], ['@cmd()'], ['-cmd()'], ['\tcmd()']]));
  assert.ok(result.slice(1).every(row => row[0].startsWith("'")));
});
test('CSV accepts 100+ records without changing legitimate repeated contacts', () => {
  const rows = Array.from({ length: 150 }, (_, i) => ['Cliente', '71999999999', `Oportunidade ${i}`]);
  assert.equal(parseCsv(exportCsv(['nome', 'telefone', 'oportunidade'], rows)).length, 151);
});
