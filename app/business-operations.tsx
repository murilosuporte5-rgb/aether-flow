'use client';
import {useMemo,useState} from 'react';
import type {Data} from './workspace';
import {CSV_COLUMNS} from '@/lib/import-validation';
import {parseCsv} from '@/lib/csv';
import {operationalMetrics} from '@/lib/metrics';
export default function BusinessOperations({data,reload}:{data:Data;reload:()=>void}) {
 const [month,setMonth]=useState(()=>{const parts=new Intl.DateTimeFormat('en-US',{timeZone:'America/Bahia',year:'numeric',month:'2-digit'}).formatToParts(new Date());return `${parts.find(p=>p.type==='year')!.value}-${parts.find(p=>p.type==='month')!.value}`});
 const [csv,setCsv]=useState(''),[headers,setHeaders]=useState<string[]>([]),[mapping,setMapping]=useState<Record<string,number>>({}),[preview,setPreview]=useState<{commands:Record<string,unknown>[];errors:string[]}|null>(null),[requestId,setRequestId]=useState(''),[busy,setBusy]=useState(false),[message,setMessage]=useState('');
 const metrics=useMemo(()=>operationalMetrics(data.opportunities,data.activities,month),[data,month]);
 const brl=(n:number)=>new Intl.NumberFormat('pt-BR',{style:'currency',currency:'BRL'}).format(n);
 async function read(file:File) {
  setMessage('');setPreview(null);
  try {if(file.size>1_000_000)throw new Error('Limite de 1 MB.');const text=await file.text();const [columns]=parseCsv(text);setCsv(text);setHeaders(columns);setMapping({});setRequestId(crypto.randomUUID());}
  catch(e){setMessage(e instanceof Error?e.message:'Arquivo inválido.');}
 }
 async function submit(confirm=false) {
  setBusy(true);setMessage('');
  try {const response=await fetch('/api/data',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({companyId:data.company?.id,csv,requestId,mapping:Object.keys(mapping).length?mapping:undefined,confirm})});const result=await response.json();if(result.commands)setPreview(result);if(result.error)throw new Error(result.error);if(result.ok){setMessage(`${result.imported} oportunidades importadas; ${result.contactsReused} contatos reutilizados; 0 sobrescritas; 0 linhas ignoradas; 0 erros.${result.retry?' Retry reconhecido: nenhuma duplicação.':''}`);reload();}else if(!response.ok&&!result.errors)throw new Error('Não foi possível concluir.');}
  catch(e){setMessage(e instanceof Error?e.message:'Falha de rede. Repita com o mesmo arquivo para recuperar.');}finally{setBusy(false);}
 }
 return <details className="business-operations" id="metrics-csv"><summary>Métricas, importação e exportação</summary>
  <div className="business-summary-metrics" aria-label="Impacto comercial"><span><small>VALOR EM ABERTO</small><strong>{brl(metrics.openValue)}</strong></span><span><small>VALOR GANHO</small><strong>{brl(metrics.wonValue)}</strong></span><span><small>GANHOS NO PERÍODO</small><strong>{metrics.won}</strong></span><span><small>TAXA DE GANHO</small><strong>{metrics.winRate===null?'Sem base':`${(metrics.winRate*100).toFixed(1)}%`}</strong></span></div>
  <label>Período de fechamento <input aria-label="Período de fechamento" type="month" required value={month} onChange={e=>{if(e.target.value)setMonth(e.target.value)}}/></label>
  <p>Horário da Bahia. Abertas e ações refletem agora; ganhos/perdas usam o mês escolhido. Valores representam oportunidades, sem comprovar recebimento.</p>
  <dl className="business-metrics">{Object.entries({'Abertas':metrics.open,'Valor aberto':brl(metrics.openValue),'Vencidas':metrics.overdue,'Hoje (a vencer)':metrics.today,'Sem próxima ação':metrics.missing,'Paradas 7+':metrics.stale,'Interação desconhecida':metrics.unknownInteraction,'Ganhos no período':metrics.won,'Perdas no período':metrics.lost,'Taxa de ganho':metrics.winRate===null?'Sem base':`${(metrics.winRate*100).toFixed(1)}%`,'Valor ganho':brl(metrics.wonValue),'Tempo até ganho':metrics.meanDays===null?'Sem base':`${metrics.meanDays.toFixed(1)} dias (${metrics.sample} ganhos)`}).map(([label,value])=><div key={label}><dt>{label}</dt><dd>{value}</dd></div>)}</dl>
  {!!metrics.unknownClosure&&<p>{metrics.unknownClosure} encerramentos antigos sem data comprovada foram excluídos do período.</p>}
  <ul>{metrics.sources.filter(s=>s.created||s.won).map(s=><li key={s.source}>{s.source}: {s.created} criadas, {s.won} ganhas, {brl(s.value)} no período.</li>)}</ul>
  <div className="business-export"><a href={`/api/data?companyId=${data.company?.id}&type=contacts`}>Exportar contatos</a><a href={`/api/data?companyId=${data.company?.id}&type=opportunities`}>Exportar oportunidades</a></div>
  <h3>Importar oportunidades</h3><p>Até 500 linhas / 1 MB. Etapas abertas existentes; contato reutilizado por telefone, cada linha cria sua oportunidade. Lote inteiro cancelado se houver erro. Valor: 1234,56. Data: 2026-10-01T10:00 (Bahia) ou ISO com fuso. Reenvie o mesmo lote para recuperar uma falha de rede.</p>
  <label>Arquivo CSV <input type="file" accept=".csv,text/csv" disabled={busy} onChange={e=>{const f=e.target.files?.[0];if(f)void read(f)}}/></label>
  {!!headers.length&&<><fieldset><legend>Mapear colunas (opcional se os nomes coincidirem)</legend>{CSV_COLUMNS.map(column=><label key={column}>{column}<select value={mapping[column]??-1} onChange={e=>{setMapping(old=>({...Object.fromEntries(CSV_COLUMNS.map(c=>[c,headers.indexOf(c)])),...old,[column]:Number(e.target.value)}));setPreview(null);setRequestId(crypto.randomUUID())}}><option value={-1}>Automático / sem coluna</option>{headers.map((h,i)=><option key={i} value={i}>{h}</option>)}</select></label>)}</fieldset><button disabled={busy} onClick={()=>void submit()}>Validar e visualizar</button></>}
  {preview&&<div><p>{preview.commands.length} linhas. {preview.errors.length} erros.</p><ul role="alert">{preview.errors.slice(0,20).map(e=><li key={e}>{e}</li>)}</ul><pre>{JSON.stringify(preview.commands.slice(0,3),null,2)}</pre><button disabled={busy||!!preview.errors.length} onClick={()=>void submit(true)}>Confirmar importação de {preview.commands.length} linhas</button></div>}
  {message&&<p role="status">{message}</p>}
 </details>;
}
