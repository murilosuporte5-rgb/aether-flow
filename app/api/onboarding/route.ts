import {createClient} from '@/lib/supabase/server';
import {templates,stageKind,type TemplateKey} from '@/lib/templates';

export const dynamic='force-dynamic';

const fail=(error:string,status=400)=>Response.json({error},{status});
const clean=(v:unknown,max:number)=>typeof v==='string'?v.trim().slice(0,max):'';
const templateKey=(v:unknown):TemplateKey|null=>typeof v==='string'&&Object.hasOwn(templates,v)?v as TemplateKey:null;

export async function POST(request:Request){
 try{
  const origin=request.headers.get('origin');
  if(origin&&origin!==new URL(request.url).origin)return fail('Origem não permitida.',403);

  const supabase=await createClient();
  const {data:{user},error:userError}=await supabase.auth.getUser();
  if(userError||!user)return fail('Entre na sua conta para continuar.',401);

  const body=await request.json() as Record<string,unknown>;
  const name=clean(body.companyName,100);
  const template=templateKey(body.template);
  if(name.length<2)return fail('Informe o nome da empresa.');
  if(!template)return fail('Selecione um nicho válido.');

  const {data:memberships,error:membershipLookupError}=await supabase
   .from('memberships')
   .select('company_id,companies(id,name,company_template,is_demo)')
   .eq('user_id',user.id);
  if(membershipLookupError)throw membershipLookupError;

  const existingMembership=(memberships||[]).find(m=>{
   const c=Array.isArray(m.companies)?m.companies[0]:m.companies;
   return c&&!c.is_demo;
  });
  if(existingMembership){
   const c=Array.isArray(existingMembership.companies)?existingMembership.companies[0]:existingMembership.companies;
   return Response.json({ok:true,companyId:existingMembership.company_id,name:c?.name||name,existing:true});
  }

  const {data:owned,error:ownedError}=await supabase
   .from('companies')
   .select('id,name,company_template')
   .eq('owner_user_id',user.id)
   .eq('is_demo',false)
   .maybeSingle();
  if(ownedError)throw ownedError;

  let company=owned;
  if(!company){
   const inserted=await supabase
    .from('companies')
    .insert({name,company_template:template,is_demo:false,owner_user_id:user.id})
    .select('id,name,company_template')
    .single();

   if(inserted.error){
    if(inserted.error.code!=='23505')throw inserted.error;
    const retry=await supabase
     .from('companies')
     .select('id,name,company_template')
     .eq('owner_user_id',user.id)
     .eq('is_demo',false)
     .single();
    if(retry.error)throw retry.error;
    company=retry.data;
   }else company=inserted.data;
  }

  if(!company)return fail('Não foi possível criar sua empresa.',500);

  const {data:membership,error:membershipError}=await supabase
   .from('memberships')
   .select('company_id')
   .eq('company_id',company.id)
   .eq('user_id',user.id)
   .maybeSingle();
  if(membershipError)throw membershipError;

  if(!membership){
   const created=await supabase.from('memberships').insert({company_id:company.id,user_id:user.id,role:'owner'});
   if(created.error)throw created.error;
  }

  const {data:stages,error:stageLookupError}=await supabase
   .from('pipeline_stages')
   .select('id')
   .eq('company_id',company.id)
   .limit(1);
  if(stageLookupError)throw stageLookupError;

  if(!stages?.length){
   const actualTemplate=(company.company_template in templates?company.company_template:template) as TemplateKey;
   const conf=templates[actualTemplate];
   const created=await supabase.from('pipeline_stages').insert(
    conf.stages.map((stage,i)=>({company_id:company!.id,name:stage,position:i,kind:stageKind(actualTemplate,i)}))
   );
   if(created.error)throw created.error;
  }

  return Response.json({ok:true,companyId:company.id,name:company.name});
 }catch(error){
  console.error('onboarding POST',error);
  return fail('Não foi possível concluir a configuração da empresa. Tente novamente.',500);
 }
}
