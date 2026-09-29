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
 const inviteEnabled=Boolean(process.env.SUPABASE_SECRET_KEY);
 return <main className="admin-page">
  <a href="/">← Voltar ao ambiente</a>
  <div className="eyebrow">AETHER WORKS · ADMINISTRAÇÃO</div>
  <h1>Liberar acesso a uma empresa</h1>
  <p>Crie um ambiente separado e envie um convite individual ao responsável. Os dados demonstrativos não serão copiados para a empresa.</p>
  {inviteEnabled?<AdminForm/>:<div className="alert">Seu acesso administrativo está ativo. O envio de convites reais fica habilitado quando a chave secreta do Supabase for configurada no ambiente de produção.</div>}
 </main>;
}
