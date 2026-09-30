import test from 'node:test';
import assert from 'node:assert/strict';
import {operationalMetrics} from '../lib/metrics.ts';
import {validateImport} from '../lib/import-validation.ts';
const stages=[{id:'open-stage',name:'Novo',kind:'open'}];
test('Import validates BRL, local Bahia dates and legitimate repeated contacts',()=>{
 const result=validateImport('nome;telefone;oportunidade;valor;estágio;próxima_acao;data_proxima_acao\nJoão;71999999999;Venda 1;1.234,56;Novo;Ligação;2026-10-01T10:00\nJoão;71999999999;Venda 2;0;Novo;;',stages);
 assert.deepEqual(result.errors,[]);assert.equal(result.commands.length,2);assert.equal(result.commands[0].value,'1234.56');assert.equal(result.commands[0].dueAt,'2026-10-01T13:00:00.000Z');
});
test('Import rejects bad phones, stages, amounts and incomplete next actions',()=>{
 const result=validateImport('nome;telefone;oportunidade;valor;estágio;próxima_acao;data_proxima_acao\nJoão;123;Venda;-1;Desconhecido;Ligação;',stages);
 assert.equal(result.errors.length,4);
});
test('Metrics use Bahia month, exclude unknown closure and show empty denominator',()=>{
 assert.equal(operationalMetrics([],[],'2026-09').winRate,null);
 const base={estimated_value:null,created_at:'2026-09-01T03:00:00Z',next_action_at:null,last_interaction_at:null,source:null};
 const result=operationalMetrics([
 {...base,status:'won',estimated_value:100,closed_at:'2026-10-01T02:59:59Z'},
 {...base,status:'lost',closed_at:'2026-10-01T03:00:00Z'},
 {...base,status:'won',closed_at:null},
 {...base,status:'open',closed_at:null},
 ],[],'2026-09',new Date('2026-09-30T12:00:00Z'));
 assert.equal(result.won,1);assert.equal(result.lost,0);assert.equal(result.winRate,1);assert.equal(result.wonValue,100);assert.equal(result.sample,1);assert.equal(result.unknownClosure,1);assert.equal(result.open,1);
});
