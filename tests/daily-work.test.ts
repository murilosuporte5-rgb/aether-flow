import {test} from 'node:test';
import assert from 'node:assert/strict';
import {elapsedDays,matchesSearch,pendingQueue} from '../lib/daily-work.ts';
const row={id:'a',status:'open',next_action_at:null,next_action_type:null,last_interaction_at:null,created_at:'2026-09-30T08:00:00Z'};
test('phone search accepts formatted, unformatted and normalized Brazilian numbers',()=>{
 const r={name:'João',organization:'Empresa A',phone:'+5571999999999'};
 for(const q of ['(71) 99999-9999','71999999999','5571999999999','João','Empresa A'])assert.equal(matchesSearch(r,q),true,q);
 assert.equal(matchesSearch(r,'51999999999'),false);
});
test('queue excludes closed and unrelated future work but includes stale work',()=>{
 const now=Date.parse('2026-09-30T12:00:00Z');
 const stale={...row,id:'stale',next_action_at:'2026-10-05T12:00:00Z',last_interaction_at:'2026-09-10T12:00:00Z'};
 const future={...row,id:'future',next_action_at:'2026-10-05T12:00:00Z'};
 assert.deepEqual(pendingQueue([future,{...row,id:'closed',status:'won'},stale,row],now).map(r=>r.id),['a','stale']);
 assert.deepEqual(pendingQueue([],now),[]);
});
test('queue has stable order for twenty missing-next-action opportunities',()=>{
 const rows=Array.from({length:20},(_,n)=>({...row,id:String(n).padStart(2,'0')})).reverse();
 assert.deepEqual(pendingQueue(rows).map(r=>r.id),rows.map(r=>r.id).sort());
});
test('unknown historical stage entry stays unknown, recorded entry is computed',()=>{
 assert.equal(elapsedDays(null),null);assert.equal(elapsedDays('invalid'),null);
 assert.equal(elapsedDays('2026-09-25T12:00:00Z',Date.parse('2026-09-30T12:00:00Z')),5);
});
