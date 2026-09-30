import {CheckCircle2,ShieldCheck,Zap} from 'lucide-react';
import LoginForm from './form';

export default function LoginPage(){
 return <main className="login login-v2">
  <div className="auth-shell">
   <section className="auth-visual">
    <div className="auth-brand"><span className="brand-mark">A</span><strong>Aether Flow</strong></div>
    <div className="auth-copy">
     <div className="eyebrow">OPERAÇÃO COMERCIAL</div>
     <h1>O próximo passo, sempre à vista.</h1>
     <p>Centralize oportunidades, retornos e prioridades sem perder tempo procurando o que fazer depois.</p>
     <div className="auth-benefits">
      <span><Zap size={16}/> Prioridades do dia em uma tela</span>
      <span><CheckCircle2 size={16}/> Próximas ações organizadas</span>
      <span><ShieldCheck size={16}/> Ambiente separado por empresa</span>
     </div>
    </div>
    <small>Aether Works · Aether Flow</small>
   </section>

   <section className="login-card login-card-v2">
    <div className="mobile-auth-brand"><span className="brand-mark">A</span><strong>Aether Flow</strong></div>
    <div className="eyebrow">BEM-VINDO</div>
    <h2>Entre no seu ambiente</h2>
    <p>Use o e-mail e a senha liberados pela Aether Works.</p>
    <LoginForm/>
    <div className="login-help"><ShieldCheck size={15}/><span>Seu acesso é individual e protegido.</span></div>
   </section>
  </div>
 </main>;
}
