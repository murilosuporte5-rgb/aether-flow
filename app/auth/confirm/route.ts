import {createClient} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';
import type {EmailOtpType} from '@supabase/supabase-js';

const otpTypes=new Set<EmailOtpType>(['signup','invite','magiclink','recovery','email_change','email']);
const redirectTo=(path:string)=>new NextResponse(null,{status:307,headers:{Location:path}});

export async function GET(request:Request){
 const url=new URL(request.url),hash=url.searchParams.get('token_hash'),type=url.searchParams.get('type'),code=url.searchParams.get('code');
 const requested=url.searchParams.get('next'),next=requested?.startsWith('/')&&!requested.startsWith('//')?requested:'/';
 const s=await createClient();

 if(hash&&type&&otpTypes.has(type as EmailOtpType)){
  const {error}=await s.auth.verifyOtp({token_hash:hash,type:type as EmailOtpType});
  if(!error){
   const target=type==='invite'?'/activate':type==='recovery'?'/activate?mode=recovery':next;
   return redirectTo(target);
  }
 }
 if(code){
  const {error}=await s.auth.exchangeCodeForSession(code);
  if(!error){
   const target=type==='recovery'?'/activate?mode=recovery':next;
   return redirectTo(target);
  }
 }
 // Supabase can deliver recovery tokens in the URL fragment (implicit flow).
 // Fragments never reach this server route, so let the client activation page
 // consume them instead of incorrectly declaring the link invalid.
 if(type==='recovery') return redirectTo('/activate?mode=recovery');
 return redirectTo('/login?access=invalid');
}
