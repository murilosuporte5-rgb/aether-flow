import {KeyRound,Link2,ShieldCheck,UserPlus} from 'lucide-react';
import {redirect} from 'next/navigation';
import {createClient} from '@/lib/supabase/server';
import {isAetherAdmin} from '@/lib/provision';
import AdminForm from './form';

export const dynamic='force-dynamic';

const loginUrl='https://aether-flow-production-0798.up.railway.app/entrar';

export default async function AdminPage(){
 const supabase=await createClient();
 const {data:{user}}=await supabase.auth.getUser();
 if(!user)redirect('/login');
 if(!await isAetherAdmin(supabase,user.id))redirect('/');

 return <main className="admin-shell">
  <header className="admin-topbar">
   <a className="back-link" href="/">← Voltar ao Aether Flow</a>
   <span className="admin-badge"><ShieldCheck size={14}/> Administrador</span>
  </header>

  <section className="admin-hero">
   <div className="admin-hero-icon"><UserPlus size={25}/></div>
   <div>
    <div className="eyebrow">ACESSOS</div>
    <h1>Criar acesso de cliente</h1>
    <p>Defina as credenciais, crie o ambiente e envie os dados para o cliente. Sem e-mail de confirmação.</p>
   </div>
  </section>

  <div className="admin-layout">
   <section className="admin-card admin-create-card">
    <div className="admin-card-head">
     <div>
      <span>Nova conta</span>
      <h2>Dados de acesso</h2>
     </div>
     <KeyRound size={21}/>
    </div>
    <AdminForm loginUrl={loginUrl}/>
   </section>

   <aside className="admin-side">
    <section className="admin-card quick-guide">
     <div className="admin-card-head compact">
      <div><span>Fluxo rápido</span><h2>Como usar</h2></div>
     </div>
     <ol className="admin-steps">
      <li><strong>1</strong><div><b>Preencha os dados</b><span>E-mail, senha e empresa.</span></div></li>
      <li><strong>2</strong><div><b>Crie o acesso</b><span>A conta já nasce liberada.</span></div></li>
      <li><strong>3</strong><div><b>Copie e envie</b><span>O cliente entra direto no sistema.</span></div></li>
     </ol>
    </section>

    <section className="admin-card client-link-card">
     <div className="link-icon"><Link2 size={18}/></div>
     <div>
      <span className="mini-label">LINK DO CLIENTE</span>
      <strong>Entrar no Aether Flow</strong>
      <a href={loginUrl} target="_blank" rel="noreferrer">{loginUrl.replace('https://','')}</a>
     </div>
    </section>
   </aside>
  </div>
 </main>;
}
