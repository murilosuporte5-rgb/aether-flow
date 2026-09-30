import {ArrowLeft,KeyRound,LogIn,ShieldCheck,UserRoundPlus} from 'lucide-react';
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

 return <main className="admin-page admin-page-v2">
  <div className="admin-topbar">
   <a className="back-link" href="/"><ArrowLeft size={16}/> Voltar ao Aether Flow</a>
   <div className="admin-badge"><ShieldCheck size={15}/> Administrador</div>
  </div>

  <section className="admin-hero">
   <div className="admin-hero-icon"><UserRoundPlus size={24}/></div>
   <div>
    <div className="eyebrow">GESTÃO DE ACESSOS</div>
    <h1>Criar acesso de cliente</h1>
    <p>Defina as credenciais, crie o ambiente e envie somente o login e a senha para o cliente.</p>
   </div>
  </section>

  <div className="admin-layout">
   <section className="admin-card">
    <div className="admin-card-head">
     <div>
      <span className="step-kicker">NOVO ACESSO</span>
      <h2>Dados do cliente</h2>
     </div>
     <span className="admin-card-number">01</span>
    </div>
    <AdminForm/>
   </section>

   <aside className="admin-help-card">
    <div className="admin-help-icon"><KeyRound size={19}/></div>
    <h3>Como funciona</h3>
    <ol>
     <li><span>1</span><div><strong>Preencha</strong><small>E-mail, senha e empresa.</small></div></li>
     <li><span>2</span><div><strong>Crie o acesso</strong><small>O usuário já nasce confirmado.</small></div></li>
     <li><span>3</span><div><strong>Envie ao cliente</strong><small>Ele entra direto com e-mail + senha.</small></div></li>
    </ol>
    <a className="client-login-link" href="/entrar" target="_blank" rel="noreferrer"><LogIn size={16}/> Abrir tela de login</a>
   </aside>
  </div>
 </main>;
}
