import {ArrowRight,CheckCircle2} from 'lucide-react';
import LoginForm from './form';

export default function LoginPage(){
 return <main className="login login-v2">
  <section className="login-shell">
   <div className="login-brand-panel">
    <div className="login-brand"><span className="brand-mark">A</span><span>Aether Flow</span></div>
    <div className="login-brand-copy">
     <span className="eyebrow">AETHER WORKS</span>
     <h1>Seu comercial sem próximos passos esquecidos.</h1>
     <p>Veja o que exige atenção agora e mantenha cada oportunidade avançando.</p>
     <div className="login-benefits">
      <span><CheckCircle2 size={16}/> Próximas ações em um só lugar</span>
      <span><CheckCircle2 size={16}/> Pipeline simples e objetivo</span>
      <span><CheckCircle2 size={16}/> Histórico por oportunidade</span>
     </div>
    </div>
   </div>

   <div className="login-form-panel">
    <div className="login-card">
     <div className="login-mobile-brand"><span className="brand-mark">A</span><b>Aether Flow</b></div>
     <div className="eyebrow">BEM-VINDO</div>
     <h2>Entre na sua conta</h2>
     <p>Use o e-mail e a senha recebidos da Aether Works.</p>
     <LoginForm/>
     <div className="login-help">Ainda não tem acesso? <span>Fale com seu administrador.</span></div>
     <div className="login-secure"><ArrowRight size={14}/> Acesso seguro e individual</div>
    </div>
   </div>
  </section>
 </main>;
}
