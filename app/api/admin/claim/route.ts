import {NextResponse} from 'next/server';
import {createClient} from '@/lib/supabase/server';

export async function POST(request:Request){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)return NextResponse.json({error:'Faça login antes de ativar o administrador.'},{status:401});
 const body=await request.json().catch(()=>({})) as {key?:string};
 const key=String(body.key||'');
 if(key.length<20)return NextResponse.json({error:'Link de ativação inválido.'},{status:400});
 const {data,error}=await supabase.rpc('claim_initial_admin',{claim_key:key});
 if(error)return NextResponse.json({error:'Não foi possível ativar o administrador.'},{status:400});
 if(!data)return NextResponse.json({error:'Este link é inválido, já foi usado ou já existe um administrador.'},{status:403});
 return NextResponse.json({ok:true});
}
