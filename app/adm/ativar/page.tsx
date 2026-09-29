import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {isAetherAdmin} from '@/lib/provision';
import ActivationForm from './form';

export const dynamic='force-dynamic';

export default async function ActivateAdmin({searchParams}:{searchParams:Promise<{key?:string}>}){
 const params=await searchParams;
 const key=String(params.key||'');
 if(key.length<20)redirect('/login');
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect('/login');
 if(await isAetherAdmin(supabase,user.id))redirect('/admin');
 return <main className="login"><div className="login-card"><div className="brand-mark">A</div><div className="eyebrow">AETHER WORKS · SETUP</div><h1>Ativar administrador</h1><ActivationForm claimKey={key}/></div></main>;
}
