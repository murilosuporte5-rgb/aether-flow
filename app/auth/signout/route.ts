import {createClient} from '@/lib/supabase/server';
import {NextResponse} from 'next/server';
export async function GET(request:Request){const s=await createClient();await s.auth.signOut();return NextResponse.redirect(new URL('/login',request.url))}
