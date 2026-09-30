import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
  "Access-Control-Allow-Methods": "POST, OPTIONS",
  "Content-Type": "application/json",
};

const templates: Record<string,string[]> = {
  generic:["Novo","Em análise","Proposta","Em negociação","Aguardando decisão","Fechado","Perdido"],
  events:["Novo contato","Briefing","Proposta","Ajustes","Aguardando sinal","Confirmado","Perdido"],
  real_estate:["Novo interessado","Atendimento","Visita agendada","Visita realizada","Proposta","Negociação","Decisão","Fechado","Perdido"],
  hvac:["Contato","Avaliação","Visita técnica","Orçamento","Ajustes","Aprovação","Execução","Perdido"],
  marble:["Contato","Orçamento","Medição","Projeto / alteração","Aprovação","Produção / instalação","Perdido"],
  construction:["Contato","Levantamento","Visita","Orçamento","Ajustes","Contrato","Em execução","Perdido"],
  furniture:["Contato","Briefing","Medição","Projeto","Proposta","Ajustes","Contrato","Perdido"],
  dental:["Contato","Avaliação","Plano apresentado","Dúvidas","Aguardando decisão","Agendado","Perdido"],
  aesthetics:["Contato","Avaliação","Plano apresentado","Dúvidas","Aguardando decisão","Agendado","Perdido"],
  pools:["Contato","Visita","Orçamento","Projeto","Ajustes","Aprovação","Instalação","Perdido"],
  equipment_rental:["Contato","Disponibilidade","Cotação","Negociação","Reserva","Contrato","Entregue","Perdido"],
  glass_aluminum:["Contato","Medição","Orçamento","Projeto","Ajustes","Aprovação","Instalação","Perdido"],
};

const stageKind=(index:number,total:number)=>index===total-1?"lost":index===total-2?"won":"open";
const json=(body:unknown,status=200)=>new Response(JSON.stringify(body),{status,headers:corsHeaders});

Deno.serve(async (req: Request) => {
  if(req.method==="OPTIONS") return new Response("ok",{headers:corsHeaders});
  if(req.method!=="POST") return json({error:"Método não permitido."},405);

  const authHeader=req.headers.get("Authorization")||"";
  const token=authHeader.startsWith("Bearer ")?authHeader.slice(7):"";
  if(!token) return json({error:"Sessão ausente."},401);

  const url=Deno.env.get("SUPABASE_URL")||"";
  const publishable=(()=>{
    try{return JSON.parse(Deno.env.get("SUPABASE_PUBLISHABLE_KEYS")||"{}").default||Deno.env.get("SUPABASE_ANON_KEY")||""}
    catch{return Deno.env.get("SUPABASE_ANON_KEY")||""}
  })();
  const secret=(()=>{
    try{return JSON.parse(Deno.env.get("SUPABASE_SECRET_KEYS")||"{}").default||Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""}
    catch{return Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")||""}
  })();
  if(!url||!publishable||!secret) return json({error:"Configuração do Supabase indisponível."},500);

  const userClient=createClient(url,publishable,{global:{headers:{Authorization:authHeader}},auth:{persistSession:false,autoRefreshToken:false}});
  const admin=createClient(url,secret,{auth:{persistSession:false,autoRefreshToken:false}});

  const {data:{user},error:userError}=await userClient.auth.getUser(token);
  if(userError||!user) return json({error:"Sessão inválida."},401);

  const {data:isAdmin,error:adminError}=await admin.from("aether_admins").select("user_id").eq("user_id",user.id).maybeSingle();
  if(adminError) return json({error:"Não foi possível validar o administrador."},500);
  if(!isAdmin) return json({error:"Acesso restrito ao administrador."},403);

  if(Number(req.headers.get('content-length')||0)>12000)return json({error:'Dados excedem o limite.'},413);
  let body:any={};
  try{body=await req.json()}catch{return json({error:"Dados inválidos."},400)}
  if(JSON.stringify(body).length>12000)return json({error:'Dados excedem o limite.'},413);
  // Password resets use the same controlled admin boundary and never send email.
  if(body.action==='reset'){
    const target=String(body.userId||'');
    const password=String(body.password||'');
    if(!/^[0-9a-f-]{36}$/i.test(target)||password.length<12||password.length>128)return json({error:'Usuário ou senha inválidos.'},400);
    const member=await admin.from('memberships').select('company_id').eq('user_id',target).eq('company_id',body.companyId).maybeSingle();
    if(member.error||!member.data)return json({error:'Usuário não pertence à empresa.'},403);
    const reserved=await userClient.rpc('begin_admin_operation',{p_event:'password_reset',p_company_id:member.data.company_id,p_target_user_id:target});
    if(reserved.error)return json({error:'Não foi possível registrar a operação ou limite excedido.'},429);
    const result=await admin.auth.admin.updateUserById(target,{password});
    const audit=await admin.from('admin_operations').update({status:result.error?'failed':'success',updated_at:new Date().toISOString()}).eq('id',reserved.data);
    if(result.error)return json({error:'Reset não concluído.',operationId:reserved.data},400);
    if(audit.error)return json({error:'Senha atualizada; registro de conclusão requer recuperação. Não repita o reset.',operationId:reserved.data},500);
    return json({ok:true,operationId:reserved.data});
  }
  if(body.action&&body.action!=='create')return json({error:'Ação inválida.'},400);
  const email=String(body.email||"").trim().toLowerCase();
  const password=String(body.password||"");
  const template=templates[String(body.template||"generic")]?String(body.template||"generic"):"generic";
  const emailName=email.split("@")[0].replace(/[._-]+/g," ").replace(/\b\w/g,(c)=>c.toUpperCase()).slice(0,100);
  const clientName=String(body.clientName||"").trim().slice(0,100)||emailName||"Cliente";
  const requestedCompanyName=String(body.companyName??body.name??"").trim();
  const companyName=requestedCompanyName.slice(0,120)||clientName;

  if(!/^\S+@\S+\.\S+$/.test(email)) return json({error:"E-mail inválido."},400);
  if(clientName.length<2) return json({error:"Informe o nome do cliente."},400);
  if(password.length<12) return json({error:"A senha precisa ter pelo menos 12 caracteres."},400);

  let createdUserId:string|null=null;
  let companyId:string|null=null;
  const reserved=await userClient.rpc('begin_admin_operation',{p_event:'account_created'});
  if(reserved.error)return json({error:'Não foi possível registrar a operação ou limite excedido.'},429);
  try{
    const created=await admin.auth.admin.createUser({
      email,
      password,
      email_confirm:true,
      user_metadata:{full_name:clientName,company_name:companyName}
    });
    if(created.error||!created.data.user){
      const failureAudit=await admin.from('admin_operations').update({status:'failed',updated_at:new Date().toISOString()}).eq('id',reserved.data);
      if(failureAudit.error)console.error('create-access audit finalization failed',{operationId:reserved.data});
      const code=created.error?.code||"";
      const msg=(created.error?.message||"").toLowerCase();
      if(code==="weak_password") return json({error:"A senha precisa ter pelo menos 12 caracteres."},400);
      if(code==="email_exists"||msg.includes("already")||msg.includes("registered")||msg.includes("exists")) return json({error:"Este e-mail já possui acesso."},409);
      throw created.error||new Error("Auth não retornou usuário.");
    }
    createdUserId=created.data.user.id;
    const stages=templates[template];
    const provision=await admin.rpc('provision_customer_workspace',{
      p_operation_id:reserved.data,p_user_id:createdUserId,p_name:companyName,p_template:template,
      p_stages:stages.map((name,index)=>({name,position:index,kind:stageKind(index,stages.length)}))
    });
    if(provision.error||!provision.data)throw new Error('Workspace provisioning failed');
    companyId=provision.data.companyId;

    return json({ok:true,email,clientName,companyName,companyId});
  }catch(error){
    // Only resources created by this request may be compensated. A failed
    // company cleanup must keep its Auth owner for recovery, rather than
    // orphaning references or hiding a partially provisioned workspace.
    const recoveryId=crypto.randomUUID();
    let cleanupFailed=false;
    if(companyId){
      const cleanup=await admin.from("companies").delete().eq("id",companyId).select("id");
      cleanupFailed=!!cleanup.error||cleanup.data?.length!==1;
    }
    if(createdUserId&&!cleanupFailed){
      const cleanup=await admin.auth.admin.deleteUser(createdUserId);
      cleanupFailed=!!cleanup.error;
    }
    // Never log the exception object: upstream errors can contain personal data.
    console.error("create-access failure",{recoveryId,companyId,userId:createdUserId,cleanupFailed});
    const audit=await admin.from('admin_operations').update({status:cleanupFailed?'recovery_required':'failed',target_user_id:createdUserId,metadata:{recoveryId,cleanupFailed},updated_at:new Date().toISOString()}).eq('id',reserved.data);
    if(audit.error)cleanupFailed=true;
    return json({error:cleanupFailed
      ?`Criação incompleta. Não repita: solicite recuperação com referência ${recoveryId}.`
      :"Não foi possível criar o acesso. Os recursos desta tentativa foram removidos.",recoveryId},500);
  }
});
