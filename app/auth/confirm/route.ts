import {createClient} from '@/lib/supabase/server';import {NextResponse} from 'next/server';
export async function GET(request:Request){const url=new URL(request.url),hash=url.searchParams.get('token_hash'),type=url.searchParams.get('type'),code=url.searchParams.get('code');const s=await createClient();
 if(hash&&(type==='invite'||type==='recovery'||type==='email')){const {error}=await s.auth.verifyOtp({token_hash:hash,type:type as 'invite'|'recovery'|'email'});if(!error)return NextResponse.redirect(new URL('/activate',url.origin))}
 if(code){const {error}=await s.auth.exchangeCodeForSession(code);if(!error)return NextResponse.redirect(new URL('/activate',url.origin))}
 return NextResponse.redirect(new URL('/login?invite=invalid',url.origin));}
