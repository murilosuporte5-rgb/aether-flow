import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';
import {consumeRateLimit} from '@/lib/rate-limit';

export async function POST(request:Request){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Faça login antes de ativar o administrador.'},{status:401});
 const rate=consumeRateLimit(`admin-claim:${user.id}`,5,10*60*1000);
 if(!rate.allowed)return NextResponse.json({error:'Muitas tentativas. Aguarde antes de tentar novamente.'},{status:429,headers:{'Retry-After':String(rate.retryAfterSeconds)}});
 const body=await request.json().catch(()=>({})) as {key?:string};
 const key=String(body.key||'');
 if(key.length<20)return NextResponse.json({error:'Link de ativação inválido.'},{status:400});
 const {error}=await supabase.from('admin_bootstrap_claims').insert({user_id:user.id,claim_key:key});
 if(error)return NextResponse.json({error:'Este link é inválido, já foi usado ou já existe um administrador.'},{status:403});
 return NextResponse.json({ok:true});
}
