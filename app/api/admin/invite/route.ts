import {createClient} from '@/lib/supabase/server';
import {serviceClient,isAetherAdmin,provisionCompany} from '@/lib/provision';
import {templates,type TemplateKey} from '@/lib/templates';

export async function POST(request:Request){
 const requestUrl=new URL(request.url),baseUrl=requestUrl.origin,origin=request.headers.get('origin');
 if(origin&&origin!==baseUrl)return Response.json({error:'Origem não autorizada.'},{status:403});
 const {data:{user}}=await (await createClient()).auth.getUser();
 if(!user)return Response.json({error:'Entre na sua conta.'},{status:401});
 if(!process.env.SUPABASE_SECRET_KEY)return Response.json({error:'Convites ainda não estão habilitados neste ambiente.'},{status:503});
 try{
  const admin=serviceClient();
  if(!await isAetherAdmin(admin,user.id))return Response.json({error:'Acesso restrito à Aether Works.'},{status:403});
  const b=await request.json() as Record<string,unknown>,name=typeof b.name==='string'?b.name.trim():'',email=typeof b.email==='string'?b.email.trim().toLowerCase():'',template=b.template as TemplateKey;
  if(name.length<2||name.length>120||!/^\S+@\S+\.\S+$/.test(email)||!Object.hasOwn(templates,template))return Response.json({error:'Verifique empresa, e-mail e nicho.'},{status:400});
  const result=await provisionCompany(admin,{name,template,email,baseUrl});
  return Response.json({ok:true,...result});
 }catch(error){
  console.error('invite failed',error);
  return Response.json({error:'Não foi possível concluir o convite. Verifique os registros antes de repetir.'},{status:500});
 }
}
