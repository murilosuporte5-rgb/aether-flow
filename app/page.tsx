import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import Workspace from './workspace';
import {serviceClient,isAetherAdmin} from '@/lib/provision';
export const dynamic='force-dynamic';
export default async function Page(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');
 const admin=await isAetherAdmin(serviceClient(),user.id);
 return <Workspace user={{name:user.user_metadata?.full_name||user.email||'Usuário',email:user.email||''}} signOut="/auth/signout" adminAccess={admin}/>;
}
