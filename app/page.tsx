import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import Workspace from './workspace';
import {isAetherAdmin} from '@/lib/provision';
export const dynamic='force-dynamic';
export default async function Page(){
 const supabase=await createClient();const {data:{user}}=await supabase.auth.getUser();if(!user)redirect('/login');
 const admin=await isAetherAdmin(supabase,user.id);
 const adminAccess=admin&&!!process.env.SUPABASE_SECRET_KEY;
 return <Workspace user={{name:user.user_metadata?.full_name||user.email||'Usuário',email:user.email||''}} signOut="/auth/signout" adminAccess={adminAccess}/>;
}
