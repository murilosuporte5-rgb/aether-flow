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

  let body:any={};
  try{body=await req.json()}catch{return json({error:"Dados inválidos."},400)}
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
  try{
    const created=await admin.auth.admin.createUser({
      email,
      password,
      email_confirm:true,
      user_metadata:{full_name:clientName,company_name:companyName}
    });
    if(created.error||!created.data.user){
      const code=created.error?.code||"";
      const msg=(created.error?.message||"").toLowerCase();
      if(code==="weak_password") return json({error:"A senha precisa ter pelo menos 12 caracteres."},400);
      if(code==="email_exists"||msg.includes("already")||msg.includes("registered")||msg.includes("exists")) return json({error:"Este e-mail já possui acesso."},409);
      throw created.error||new Error("Auth não retornou usuário.");
    }
    createdUserId=created.data.user.id;

    const company=await admin.from("companies").insert({
      name:companyName,
      company_template:template,
      is_demo:false,
      owner_user_id:createdUserId
    }).select("id").single();
    if(company.error||!company.data) throw company.error||new Error("Empresa não criada.");
    companyId=company.data.id;

    const membership=await admin.from("memberships").insert({company_id:companyId,user_id:createdUserId,role:"owner"});
    if(membership.error) throw membership.error;

    const stages=templates[template];
    const stageRows=stages.map((name,index)=>({company_id:companyId,name,position:index,kind:stageKind(index,stages.length)}));
    const stageInsert=await admin.from("pipeline_stages").insert(stageRows);
    if(stageInsert.error) throw stageInsert.error;

    return json({ok:true,email,clientName,companyName,companyId});
  }catch(error){
    if(companyId) await admin.from("companies").delete().eq("id",companyId);
    if(createdUserId) await admin.auth.admin.deleteUser(createdUserId);
    console.error("create-access failed",error);
    return json({error:"Não foi possível criar o acesso. Nenhum acesso parcial foi mantido."},500);
  }
});