import { ArrowUpRight, ShieldCheck } from 'lucide-react';
import { AetherMark } from '../aether-logo';
import SignupForm from './form';

export default function CadastroPage(){
 return <main className="login login-v2"><div className="auth-shell"><section className="auth-visual"><div className="auth-brand"><AetherMark/><strong>Aether Flow</strong></div><div className="auth-copy"><div className="eyebrow">TESTE DE 7 DIAS</div><h1>Organize o próximo passo da sua equipe.</h1><p>Crie seu acesso e configure o ambiente comercial da empresa com radar, contatos, pipeline e histórico.</p></div><small>Aether Works · Aether Flow</small></section><section className="login-card login-card-v2"><div className="mobile-auth-brand"><AetherMark/><strong>Aether Flow</strong></div><div className="eyebrow">COMEÇAR</div><h2>Crie seu ambiente</h2><p>Use seu e-mail para criar o acesso individual da empresa.</p><SignupForm/><div className="login-help"><ShieldCheck size={15}/><span>Seu acesso é individual e protegido.</span></div><a className="login-landing-link" href="/landing">Conheça o Aether Flow <ArrowUpRight size={15}/></a></section></div></main>;
}
