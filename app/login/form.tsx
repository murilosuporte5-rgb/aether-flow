'use client';
import {useEffect,useState} from 'react';
import {Eye,EyeOff,LoaderCircle,LogIn} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

const TERMS_VERSION = '2026-10-03';

export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[remember,setRemember]=useState(true),[acceptedTerms,setAcceptedTerms]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState(''),[cooldown,setCooldown]=useState(0);
 const router=useRouter();
 useEffect(()=>{const stored=window.localStorage.getItem('aether-flow:remember-email');if(stored)setEmail(stored);if(window.localStorage.getItem('aether-flow:terms-version')===TERMS_VERSION)setAcceptedTerms(true);const tick=()=>setCooldown(Math.max(0,Number(window.localStorage.getItem('aether-flow:login-lock-until')||0)-Date.now()));tick();const timer=window.setInterval(tick,1000);return()=>window.clearInterval(timer)},[]);

 async function passwordLogin(e:React.FormEvent){
  e.preventDefault();if(cooldown>0)return;setBusy(true);setError('');
  try{
   if(remember)window.localStorage.setItem('aether-flow:remember-email',email.trim().toLowerCase());else window.localStorage.removeItem('aether-flow:remember-email');
   const supabase=createClient();
   const {error}=await supabase.auth.signInWithPassword({email:email.trim().toLowerCase(),password});
   if(error)throw error;
   // Keep the sign-in flow available if a disposable Auth runtime has not
   // loaded the optional acceptance RPC yet; production still records it when
   // the migration is available.
   await supabase.rpc('accept_terms',{p_version:TERMS_VERSION}).catch(()=>undefined);
   // The terms RPC is the authoritative acceptance record. Profile metadata is
   // only a convenience marker and must not turn a valid login into a generic
   // credential error when an isolated Auth runtime rejects metadata updates.
   await supabase.auth.updateUser({data:{aether_terms_version:TERMS_VERSION,aether_terms_accepted_at:new Date().toISOString()}}).catch(()=>undefined);
   window.localStorage.setItem('aether-flow:terms-version',TERMS_VERSION);
   window.localStorage.removeItem('aether-flow:login-failures');window.localStorage.removeItem('aether-flow:login-lock-until');
   router.replace('/');router.refresh();
  }catch{const failures=Number(window.localStorage.getItem('aether-flow:login-failures')||0)+1;window.localStorage.setItem('aether-flow:login-failures',String(failures));if(failures>=3){const seconds=Math.min(120,15*2**Math.min(failures-3,3));const until=Date.now()+seconds*1000;window.localStorage.setItem('aether-flow:login-lock-until',String(until));setCooldown(until-Date.now());setError(`Muitas tentativas. Aguarde ${seconds} segundos e tente novamente.`)}else setError('E-mail ou senha inválidos. Confira os dados enviados pelo administrador.')}
  finally{setBusy(false)}
 }

 return <form className="login-form login-form-v2" onSubmit={passwordLogin}>
  <label><span>E-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="seu@email.com" required/></label>
  <label><span>Senha</span><div className="password-control"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Sua senha" required/><button type="button" className="field-icon-btn" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
  <div className="login-options"><label className="remember-label"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Lembrar meu e-mail</span></label><a className="forgot-link" href="/recuperar-senha">Esqueceu sua senha?</a></div>
  <label className="terms-label"><input type="checkbox" checked={acceptedTerms} onChange={e=>setAcceptedTerms(e.target.checked)} required/><span>Li e aceito os <a href="/termos" target="_blank" rel="noreferrer">Termos de uso</a> e a <a href="/privacidade" target="_blank" rel="noreferrer">Política de privacidade</a>.<small>O aceite registra a versão vigente. Seus dados são usados para autenticação e operação do serviço, com os direitos e canais de solicitação descritos na Política de privacidade.</small></span></label>
  {error&&<p role="alert" className="form-error">{error}</p>}
  <button type="submit" className="primary login-action" disabled={busy||cooldown>0||!acceptedTerms} aria-busy={busy}><>{busy?<LoaderCircle className="loading-spinner" size={17}/>:<LogIn size={17}/>}</>{busy?'Entrando…':cooldown>0?`Aguarde ${Math.ceil(cooldown/1000)}s`:'Entrar no Aether Flow'}</button>
  {busy&&<div className="login-loading" role="status" aria-live="polite"><LoaderCircle className="loading-spinner" size={22}/><strong>Preparando seu ambiente</strong><span>Validando acesso com segurança…</span></div>}
 </form>;
}
