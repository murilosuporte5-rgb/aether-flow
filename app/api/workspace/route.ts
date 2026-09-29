import {createClient} from '@/lib/supabase/server';
import {templates,type TemplateKey} from '@/lib/templates';
import {seedDemo} from '@/lib/provision';
import type {SupabaseClient} from '@supabase/supabase-js';
export const dynamic='force-dynamic';
const fail=(error:string,status=400)=>Response.json({error},{status});
const txt=(value:unknown,max=160)=>typeof value==='string'?value.trim().slice(0,max):'';
const validDate=(value:unknown)=>{if(!value)return null;const n=Date.parse(String(value));return Number.isFinite(n)?new Date(n).toISOString():null};
const templateKey=(v:unknown):TemplateKey=>typeof v==='string'&&Object.hasOwn(templates,v)?v as TemplateKey:'events';
async function access(s:SupabaseClient, userId:string, requestedCompany?:unknown, requestedTemplate?:unknown){
 const {data,error}=await s.from('memberships').select('company_id,role,companies(id,name,company_template,is_demo)').eq('user_id',userId);
 if(error)throw error;
 const companies=(data||[]).flatMap(m=>{
  const co=Array.isArray(m.companies)?m.companies[0]:m.companies;
  return co?[{id:m.company_id,role:m.role,name:co.name as string,company_template:co.company_template as string,is_demo:co.is_demo as boolean}]:[];
 });
 if(!companies.length)return {companies,company:null};
 const id=txt(requestedCompany,100),template=templateKey(requestedTemplate);
 const company=id?companies.find(x=>x.id===id)||null:companies.find(x=>x.is_demo&&x.company_template===template)||companies.find(x=>!x.is_demo)||companies[0];
 return {companies,company};
}
async function context(requestedCompany?:unknown,requestedTemplate?:unknown){
 const s=await createClient(),{data:{user},error}=await s.auth.getUser();if(error||!user)return null;
 let state=await access(s,user.id,requestedCompany,requestedTemplate);
 if(!requestedCompany){
  const template=templateKey(requestedTemplate),hasReal=state.companies.some(x=>!x.is_demo),hasDemo=state.companies.some(x=>x.is_demo&&x.company_template===template);
  if(!hasReal&&!hasDemo){await seedDemo(s,user.id,template);state=await access(s,user.id,requestedCompany,requestedTemplate)}
 }
 return {s,user,...state};
}
async function snapshot(s:SupabaseClient,c:string){
 const [stages,opps,contacts,acts,history,profiles,memberships]=await Promise.all([
  s.from('pipeline_stages').select('*').eq('company_id',c).order('position'),
  s.from('opportunities').select('*').eq('company_id',c).order('updated_at',{ascending:false}),
  s.from('contacts').select('*').eq('company_id',c),
  s.from('activities').select('*').eq('company_id',c).order('due_at'),
  s.from('opportunity_history').select('*').eq('company_id',c).order('created_at',{ascending:false}),
  s.from('profiles').select('id,display_name'),
  s.from('memberships').select('user_id').eq('company_id',c)
 ]);
 for(const r of [stages,opps,contacts,acts,history,profiles,memberships])if(r.error)throw r.error;
 const contactMap=new Map((contacts.data||[]).map(x=>[x.id,x])),stageMap=new Map((stages.data||[]).map(x=>[x.id,x])),profileMap=new Map((profiles.data||[]).map(x=>[x.id,x]));
 const opportunities=(opps.data||[]).map(o=>{const ct=contactMap.get(o.contact_id),st=stageMap.get(o.stage_id),owner=profileMap.get(o.owner_id);return {...o,estimated_value:o.estimated_value==null?null:Number(o.estimated_value),contact_name:ct?.name||'Contato',phone:ct?.phone||null,organization:ct?.organization||null,stage_name:st?.name||'Estágio',stage_kind:st?.kind||'open',owner_name:owner?.display_name||'Responsável'}});
 return {stages:stages.data||[],opportunities,activities:acts.data||[],history:history.data||[],owners:(memberships.data||[]).map(m=>profileMap.get(m.user_id)||{id:m.user_id,display_name:'Responsável'})};
}
export async function GET(request:Request){
 try{const url=new URL(request.url),ctx=await context(url.searchParams.get('companyId'),url.searchParams.get('template'));if(!ctx)return fail('Entre na sua conta para continuar.',401);if(!ctx.company)return fail('Seu acesso ainda não foi vinculado a uma empresa. Contate a Aether Works.',403);
 return Response.json({company:{id:ctx.company.id,name:ctx.company.name,demo:ctx.company.is_demo},companies:ctx.companies,template:ctx.company.company_template,...await snapshot(ctx.s,ctx.company.id)});
 }catch(error){console.error('workspace GET',error);return fail('Não foi possível carregar o ambiente.',500)}
}
export async function POST(request:Request){
 try{
  const origin=request.headers.get('origin');if(origin&&origin!==new URL(request.url).origin)return fail('Origem não permitida.',403);
  const b=await request.json() as Record<string,unknown>,ctx=await context(b.companyId,b.template);if(!ctx)return fail('Sessão expirada.',401);if(!ctx.company)return fail('Empresa não vinculada à sua conta.',403);
  if(b.companyId&&b.companyId!==ctx.company.id)return fail('Empresa não autorizada.',403);
  const {s,user,company}=ctx,c=company.id,kind=txt(b.kind,30),oid=txt(b.id,100),stamp=new Date().toISOString();
  const history=async(event:string,description:string,id:string)=>{const {error}=await s.from('opportunity_history').insert({company_id:c,opportunity_id:id,actor_id:user.id,event,description});if(error)throw error};
  const assert=({error}:{error:unknown})=>{if(error)throw error};
  if(kind==='create'){
   const contactName=txt(b.contactName,100),title=txt(b.title,160),stageId=txt(b.stageId,100),value=b.value===''||b.value==null?null:Number(b.value);
   if(!contactName||!title)return fail('Informe cliente e oportunidade.');if(value!==null&&(!Number.isFinite(value)||value<0))return fail('Valor inválido.');
   const {data:stage}=await s.from('pipeline_stages').select('id,kind').eq('company_id',c).eq('id',stageId).maybeSingle();if(!stage)return fail('Estágio inválido.');
   const contact=await s.from('contacts').insert({company_id:c,name:contactName,phone:txt(b.phone,30)||null,organization:txt(b.organization,100)||null}).select('id').single();assert(contact);if(!contact.data)return fail('Não foi possível criar o contato.',500);
   const opportunity=await s.from('opportunities').insert({company_id:c,contact_id:contact.data.id,title,stage_id:stageId,owner_id:user.id,estimated_value:value,status:stage.kind==='won'?'won':stage.kind==='lost'?'lost':'open',source:txt(b.source,80)||null,details:txt(b.details,500)||null,last_interaction_at:stamp}).select('id').single();assert(opportunity);if(!opportunity.data)return fail('Não foi possível criar a oportunidade.',500);
   await history('created','Oportunidade criada',opportunity.data.id);return Response.json({ok:true,id:opportunity.data.id});
  }
  const {data:row,error:lookupError}=await s.from('opportunities').select('id,contact_id,status,owner_id').eq('company_id',c).eq('id',oid).maybeSingle();if(lookupError)throw lookupError;if(!row)return fail('Oportunidade não encontrada nesta empresa.',404);
  if(kind==='edit'){
   const contactName=txt(b.contactName,100),title=txt(b.title,160),value=b.value===''||b.value==null?null:Number(b.value);if(!contactName||!title||value!==null&&(!Number.isFinite(value)||value<0))return fail('Verifique cliente, oportunidade e valor.');
   assert(await s.from('contacts').update({name:contactName,phone:txt(b.phone,30)||null,organization:txt(b.organization,100)||null}).eq('company_id',c).eq('id',row.contact_id));
   assert(await s.from('opportunities').update({title,estimated_value:value,source:txt(b.source,80)||null,details:txt(b.details,500)||null,last_interaction_at:stamp,updated_at:stamp}).eq('company_id',c).eq('id',oid));await history('edit','Dados da oportunidade atualizados',oid);
  }else if(kind==='stage'){
   const {data:stage,error}=await s.from('pipeline_stages').select('id,name,kind').eq('company_id',c).eq('id',txt(b.stageId,100)).maybeSingle();if(error)throw error;if(!stage)return fail('Estágio inválido.');
   const terminal=stage.kind!=='open';const patch:Record<string,unknown>={stage_id:stage.id,status:stage.kind==='won'?'won':stage.kind==='lost'?'lost':'open',last_interaction_at:stamp,updated_at:stamp};if(terminal)Object.assign(patch,{next_action_type:null,next_action_at:null,next_action_note:null});
   assert(await s.from('opportunities').update(patch).eq('company_id',c).eq('id',oid));if(terminal)assert(await s.from('activities').update({status:'replaced'}).eq('company_id',c).eq('opportunity_id',oid).eq('status','pending'));await history('stage',`Estágio alterado para ${stage.name}`,oid);
  }else if(kind==='schedule'||kind==='reschedule'){
   if(row.status!=='open')return fail('Reabra a oportunidade antes de agendar.');const due=validDate(b.dueAt),type=txt(b.actionType,60),note=txt(b.note,500);if(!due||!type)return fail('Informe tipo, data e horário.');
   assert(await s.from('activities').update({status:'replaced'}).eq('company_id',c).eq('opportunity_id',oid).eq('status','pending'));
   assert(await s.from('activities').insert({company_id:c,opportunity_id:oid,owner_id:row.owner_id,type,due_at:due,note:note||null,status:'pending'}));
   assert(await s.from('opportunities').update({next_action_type:type,next_action_at:due,next_action_note:note||null,updated_at:stamp}).eq('company_id',c).eq('id',oid));await history(kind==='reschedule'?'rescheduled':'scheduled',`${type} para ${new Date(due).toLocaleString('pt-BR',{timeZone:'America/Sao_Paulo'})}`,oid);
  }else if(kind==='complete'){
   const activityId=txt(b.activityId,100),{data:activity,error}=await s.from('activities').select('id').eq('company_id',c).eq('opportunity_id',oid).eq('id',activityId).eq('status','pending').maybeSingle();if(error)throw error;if(!activity)return fail('Ação pendente não encontrada.',404);
   assert(await s.from('activities').update({status:'done',completed_at:stamp}).eq('company_id',c).eq('id',activityId));assert(await s.from('opportunities').update({next_action_type:null,next_action_at:null,next_action_note:null,last_interaction_at:stamp,updated_at:stamp}).eq('company_id',c).eq('id',oid));await history('completed','Próxima ação concluída',oid);
  }else if(kind==='comment'){
   const comment=txt(b.comment,500);if(!comment)return fail('Escreva uma observação.');await history('comment',comment,oid);assert(await s.from('opportunities').update({last_interaction_at:stamp,updated_at:stamp}).eq('company_id',c).eq('id',oid));
  }else return fail('Ação desconhecida.');return Response.json({ok:true});
 }catch(error){console.error('workspace POST',error);return fail('Não foi possível concluir a ação. Atualize a tela para verificar o estado atual antes de tentar novamente.',500)}
}
