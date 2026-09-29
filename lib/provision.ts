import 'server-only';
import {createClient,type SupabaseClient} from '@supabase/supabase-js';
import {templates,demoNames,stageKind,type TemplateKey} from './templates';
export function serviceClient(){
 const url=process.env.NEXT_PUBLIC_SUPABASE_URL,secret=process.env.SUPABASE_SECRET_KEY;
 if(!url||!secret)throw new Error('Supabase server configuration is missing');
 return createClient(url,secret,{auth:{autoRefreshToken:false,persistSession:false}});
}
function checked<T>(result:{data:T,error:unknown}):NonNullable<T>{if(result.error)throw result.error;if(result.data==null)throw new Error('Supabase returned no data');return result.data as NonNullable<T>}
function assertOk(result:{error:unknown}){if(result.error)throw result.error}
export async function isAetherAdmin(admin:SupabaseClient,userId:string){const {data,error}=await admin.from('aether_admins').select('user_id').eq('user_id',userId).maybeSingle();if(error)throw error;return !!data}
const dueDate=(days:number,hour:number)=>{const local=new Date(new Date().toLocaleString('en-US',{timeZone:'America/Sao_Paulo'}));return new Date(local.getTime()+days*86400000+(hour-local.getHours())*3600000-local.getMinutes()*60000+3*3600000).toISOString()};
export async function seedDemo(admin:SupabaseClient,userId:string,t:TemplateKey){
 const {data:existing,error:lookupError}=await admin.from('companies').select('id').eq('is_demo',true).eq('demo_owner_id',userId).eq('company_template',t).maybeSingle();
 if(lookupError)throw lookupError;
 let companyId=existing?.id;
 if(!companyId){const inserted=checked(await admin.from('companies').insert({name:'Aether Demo Company',company_template:t,is_demo:true,demo_owner_id:userId}).select('id').single());companyId=inserted.id}
 assertOk(await admin.from('memberships').upsert({company_id:companyId,user_id:userId,role:'owner'},{onConflict:'company_id,user_id'}));
 const previous=checked(await admin.from('pipeline_stages').select('id,position,kind').eq('company_id',companyId).order('position'));
 let stages=previous;
 if(!stages?.length){const conf=templates[t];stages=checked(await admin.from('pipeline_stages').insert(conf.stages.map((name,i)=>({company_id:companyId,name,position:i,kind:stageKind(t,i)}))).select('id,position,kind')).sort((a,b)=>a.position-b.position)}
 const present=checked(await admin.from('opportunities').select('id').eq('company_id',companyId).limit(1));if(present?.length)return companyId;
 const conf=templates[t];
 const contacts=checked(await admin.from('contacts').insert(demoNames.map((name,i)=>({company_id:companyId,name,organization:i%5===2?name:null}))).select('id'));
 const opps=checked(await admin.from('opportunities').insert(demoNames.map((_,i)=>{
  const stage=stages[[2,4,3,1,4,2,5,0,3,4,2,1,0,5,6,3][i]%stages.length];const due=i===3||i===14||i===15?null:dueDate([-1,-1,1,0,0,0,3,5,0,2,0,7,0,1,4,-2][i],[10,16,11,14,14,15,9,10,17,13,11,10,16,9,12,15][i]);return {company_id:companyId,contact_id:contacts[i].id,title:conf.titles[i%conf.titles.length],stage_id:stage.id,owner_id:userId,estimated_value:(i+2)*1350,next_action_type:due?'Cobrar retorno':null,next_action_at:due,next_action_note:i===1?'Confirmar interesse e próximos passos':null,status:stage.kind==='won'?'won':stage.kind==='lost'?'lost':'open',source:'Demonstração',details:t==='events'?['Casamento · 18/12','Corporativo · 22/11','Formatura · 04/12'][i%3]:null,last_interaction_at:dueDate(-i%5,10)}
 })).select('id,status,next_action_at'));
 assertOk(await admin.from('opportunity_history').insert(opps.map(o=>({company_id:companyId,opportunity_id:o.id,actor_id:userId,event:'created',description:'Oportunidade fictícia criada para demonstração'}))));
 const activities=opps.filter(o=>o.status==='open'&&o.next_action_at).map(o=>({company_id:companyId,opportunity_id:o.id,owner_id:userId,type:'Cobrar retorno',due_at:o.next_action_at,status:'pending'}));if(activities.length)assertOk(await admin.from('activities').insert(activities));
 return companyId;
}
export async function provisionCompany(admin:SupabaseClient,{name,template,email,baseUrl}:{name:string,template:TemplateKey,email:string,baseUrl:string}){
 const company=checked(await admin.from('companies').insert({name,company_template:template,is_demo:false}).select('id').single());
 try{
  const conf=templates[template];assertOk(await admin.from('pipeline_stages').insert(conf.stages.map((stage,i)=>({company_id:company.id,name:stage,position:i,kind:stageKind(template,i)}))));
  const invited=await admin.auth.admin.inviteUserByEmail(email,{redirectTo:`${baseUrl}/activate`});if(invited.error||!invited.data.user)throw invited.error||new Error('Invite returned no user');
  assertOk(await admin.from('memberships').insert({company_id:company.id,user_id:invited.data.user.id,role:'owner'}));
  return {companyId:company.id,email};
 }catch(error){await admin.from('companies').delete().eq('id',company.id);throw error}
}
