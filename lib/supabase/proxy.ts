import {createServerClient} from '@supabase/ssr';
import {NextResponse,type NextRequest} from 'next/server';
import {SUPABASE_PUBLISHABLE_KEY,SUPABASE_URL} from './config';

export async function updateSession(request:NextRequest){
 let response=NextResponse.next({request});
 const supabase=createServerClient(SUPABASE_URL,SUPABASE_PUBLISHABLE_KEY,{
  cookies:{getAll(){return request.cookies.getAll()},setAll(items,headers){items.forEach(({name,value})=>request.cookies.set(name,value));response=NextResponse.next({request});items.forEach(({name,value,options})=>response.cookies.set(name,value,options));Object.entries(headers||{}).forEach(([k,v])=>response.headers.set(k,v))}}
 });
 await supabase.auth.getClaims();
 response.headers.set('X-Content-Type-Options','nosniff');
 response.headers.set('X-Frame-Options','DENY');
 response.headers.set('Referrer-Policy','strict-origin-when-cross-origin');
 response.headers.set('Permissions-Policy','camera=(), microphone=(), geolocation=()');
 if(request.nextUrl.protocol==='https:') response.headers.set('Strict-Transport-Security','max-age=31536000');
 return response;
}
