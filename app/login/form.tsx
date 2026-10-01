'use client';
import {useEffect,useState} from 'react';
import {Eye,EyeOff,LoaderCircle,LogIn} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[showPassword,setShowPassword]=useState(false),[remember,setRemember]=useState(true),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const router=useRouter();
 useEffect(()=>{const stored=window.localStorage.getItem('aether-flow:remember-email');if(stored)setEmail(stored)},[]);

 async function passwordLogin(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   if(remember)window.localStorage.setItem('aether-flow:remember-email',email.trim().toLowerCase());else window.localStorage.removeItem('aether-flow:remember-email');
   const {error}=await createClient().auth.signInWithPassword({email:email.trim().toLowerCase(),password});
   if(error)throw error;
   router.replace('/');router.refresh();
  }catch{setError('E-mail ou senha inválidos. Confira os dados enviados pelo administrador.')}
  finally{setBusy(false)}
 }

 return <form className="login-form login-form-v2" onSubmit={passwordLogin}>
  <label><span>E-mail</span><input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="seu@email.com" required/></label>
  <label><span>Senha</span><div className="password-control"><input type={showPassword?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Sua senha" required/><button type="button" className="field-icon-btn" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button></div></label>
  <div className="login-options"><label className="remember-label"><input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)}/><span>Lembrar-me</span></label><a className="forgot-link" href="/recuperar-senha">Esqueceu sua senha?</a></div>
  {error&&<p role="alert" className="form-error">{error}</p>}
  <button type="submit" className="primary login-action" disabled={busy} aria-busy={busy}><>{busy?<LoaderCircle className="loading-spinner" size={17}/>:<LogIn size={17}/>}</>{busy?'Entrando…':'Entrar no Aether Flow'}</button>
  {busy&&<div className="login-loading" role="status" aria-live="polite"><LoaderCircle className="loading-spinner" size={22}/><strong>Preparando seu ambiente</strong><span>Validando acesso com segurança…</span></div>}
 </form>;
}
