import {ArrowUpRight,CheckCircle2,Clock3,ShieldCheck,Target} from 'lucide-react';
import LoginForm from './form';

export default function LoginPage(){
 return <main className="login login-v2">
  <div className="auth-shell">
   <section className="auth-visual">
    <div className="auth-brand"><span className="brand-mark">A</span><strong>Aether Flow</strong></div>
    <div className="auth-copy">
     <div className="eyebrow">RADAR DE OPORTUNIDADES</div>
     <h1>Saiba quem precisa de retorno antes que a venda esfrie.</h1>
     <p>O Aether Flow organiza urgência, compromissos e oportunidades paradas em uma fila clara para sua equipe agir.</p>
     <div className="auth-preview" aria-label="Prévia do radar de atenção">
      <div className="auth-preview-head"><span>RADAR DE ATENÇÃO</span><strong>HOJE</strong></div>
      <div className="auth-preview-row"><span className="auth-preview-icon late"><Clock3 size={14}/></span><div><strong>Retorno vencido</strong><small>Proposta comercial · há 2 dias</small></div><span className="auth-preview-tag">Agir agora</span></div>
      <div className="auth-preview-row"><span className="auth-preview-icon due"><Target size={14}/></span><div><strong>Ação para hoje</strong><small>Ligação de acompanhamento</small></div><span className="auth-preview-tag">Hoje</span></div>
      <div className="auth-preview-row"><span className="auth-preview-icon missing"><ArrowUpRight size={14}/></span><div><strong>Sem próximo passo</strong><small>Defina o que acontece depois</small></div><span className="auth-preview-tag">Revisar</span></div>
     </div>
     <div className="auth-benefits">
      <span><CheckCircle2 size={16}/> Fila ordenada pela urgência real</span>
      <span><ShieldCheck size={16}/> Cada empresa em seu próprio ambiente</span>
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
