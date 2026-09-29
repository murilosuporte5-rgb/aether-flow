import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {isAetherAdmin} from '@/lib/provision';
import AdminForm from './form';

export const dynamic='force-dynamic';

export default async function AdminPage(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect('/login');
 if(!await isAetherAdmin(supabase,user.id))redirect('/');

 return <main className="admin-page">
  <a href="/">← Voltar ao ambiente</a>
  <div className="eyebrow">AETHER FLOW · ADMINISTRAÇÃO</div>
  <h1>Criar acesso</h1>
  <p>Defina o e-mail e a senha do cliente. O acesso nasce confirmado, sem convite ou confirmação por e-mail.</p>
  <AdminForm/>
  <div className="alert">Link para o cliente entrar: <strong>https://aether-flow-production-0798.up.railway.app/entrar</strong></div>
 </main>;
}
