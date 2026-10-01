import { TIME_ZONE } from './execution.ts';
type Opportunity = { status:string; estimated_value:number|null; created_at:string; closed_at?:string|null; next_action_at:string|null; last_interaction_at:string|null; source:string|null };
type Activity = { status:string; due_at:string };
export function operationalMetrics(opps:Opportunity[], activities:Activity[], month:string, now=new Date()) {
  if (!/^\d{4}-(0[1-9]|1[0-2])$/.test(month)) throw new Error('Mês inválido.');
  const [year,m] = month.split('-').map(Number);
  const start = Date.parse(`${month}-01T00:00:00-03:00`);
  const next = m===12 ? `${year+1}-01` : `${year}-${String(m+1).padStart(2,'0')}`;
  const end = Date.parse(`${next}-01T00:00:00-03:00`);
  const open = opps.filter(o=>o.status==='open');
  const closed = opps.filter(o=>o.status!=='open' && o.closed_at && Date.parse(o.closed_at)>=start && Date.parse(o.closed_at)<end);
  const won = closed.filter(o=>o.status==='won'), lost=closed.filter(o=>o.status==='lost');
  const dateKey=(d:Date)=>new Intl.DateTimeFormat('en-CA',{timeZone:TIME_ZONE,year:'numeric',month:'2-digit',day:'2-digit'}).format(d);
  const pending=activities.filter(a=>a.status==='pending');
  const durations=won.map(o=>(Date.parse(o.closed_at!)-Date.parse(o.created_at))/86400000).filter(d=>d>=0);
  const sources = [...new Set(opps.map(o=>o.source || 'Não informada'))].map(source=>({source,created:opps.filter(o=>(o.source||'Não informada')===source && Date.parse(o.created_at)>=start && Date.parse(o.created_at)<end).length,won:won.filter(o=>(o.source||'Não informada')===source).length,value:won.filter(o=>(o.source||'Não informada')===source).reduce((sum,o)=>sum+(o.estimated_value??0),0)}));
  return {open:open.length,openValue:open.reduce((s,o)=>s+(o.estimated_value??0),0),overdue:pending.filter(a=>Date.parse(a.due_at)<now.getTime()).length,today:pending.filter(a=>Date.parse(a.due_at)>=now.getTime()&&dateKey(new Date(a.due_at))===dateKey(now)).length,missing:open.filter(o=>!o.next_action_at).length,stale:open.filter(o=>o.last_interaction_at&&now.getTime()-Date.parse(o.last_interaction_at)>=7*86400000).length,unknownInteraction:open.filter(o=>!o.last_interaction_at).length,won:won.length,lost:lost.length,winRate:won.length+lost.length?won.length/(won.length+lost.length):null,wonValue:won.reduce((s,o)=>s+(o.estimated_value??0),0),meanDays:durations.length?durations.reduce((s,d)=>s+d,0)/durations.length:null,sample:durations.length,unknownClosure:opps.filter(o=>o.status!=='open'&&!o.closed_at).length,sources};
}
