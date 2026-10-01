import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";
const headers={"Access-Control-Allow-Origin":"*","Access-Control-Allow-Headers":"authorization, x-client-info, apikey, content-type","Access-Control-Allow-Methods":"POST, OPTIONS","Content-Type":"application/json"};
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers});
Deno.serve(async req=>{
  if(req.method==='OPTIONS')return new Response('ok',{headers});
  if(req.method!=='POST')return json({error:'Método não permitido.'},405);
  const auth=req.headers.get('Authorization')||''; if(!auth.startsWith('Bearer '))return json({error:'Sessão ausente.'},401);
  const url=Deno.env.get('SUPABASE_URL')||'', anon=Deno.env.get('SUPABASE_ANON_KEY')||'', secret=Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')||'';
  if(!url||!anon||!secret)return json({error:'Configuração indisponível.'},500);
  const userClient=createClient(url,anon,{global:{headers:{Authorization:auth}},auth:{persistSession:false,autoRefreshToken:false}}), admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});
  const {data:{user}}=await userClient.auth.getUser(); if(!user)return json({error:'Sessão inválida.'},401);
  let body:any; try{body=await req.json()}catch{return json({error:'Dados inválidos.'},400)}
  const companyId=String(body.companyId||''), email=String(body.email||'').trim().toLowerCase(), name=String(body.displayName||'').trim().slice(0,100), role=body.role==='manager'?'manager':'member';
  if(!/^[0-9a-f-]{36}$/i.test(companyId)||!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)||name.length<2)return json({error:'Informe empresa, nome e e-mail válidos.'},400);
  let created=false, targetId='';
  const existing=await admin.auth.admin.listUsers({page:1,perPage:1000});
  const match=existing.data.users.find(candidate=>candidate.email?.toLowerCase()===email);
  if(match) targetId=match.id;
  if(!targetId){
    const invited=await admin.auth.admin.inviteUserByEmail(email,{data:{full_name:name}});
    if(invited.error||!invited.data.user)return json({error:'Não foi possível convidar este e-mail.'},409);
    targetId=invited.data.user.id; created=true;
  }
  const result=await userClient.rpc('team_add_member',{p_company_id:companyId,p_user_id:targetId,p_display_name:name,p_role:role});
  if(result.error){if(created)await admin.auth.admin.deleteUser(targetId);return json({error:result.error.message.includes('3 funcionários')?result.error.message:'Não foi possível adicionar o funcionário.'},result.error.code==='42501'?403:409)}
  return json({ok:true,invited:created});
});
