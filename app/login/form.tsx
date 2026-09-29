'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const router=useRouter();

 async function passwordLogin(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   const {error}=await createClient().auth.signInWithPassword({email,password});
   if(error)throw error;
   router.replace('/');router.refresh();
  }catch{setError('Não foi possível entrar. Verifique e-mail e senha.')}
  finally{setBusy(false)}
 }

 async function emailLink(){
  const clean=email.trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(clean)){setError('Informe um e-mail válido.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const {error}=await createClient().auth.signInWithOtp({
    email:clean,
    options:{emailRedirectTo:`${window.location.origin}/auth/confirm?next=/`,shouldCreateUser:true}
   });
   if(error)throw error;
   setNotice('Link enviado. Abra o e-mail neste dispositivo para entrar ou criar sua demonstração.');
  }catch{setError('Não foi possível enviar o link de acesso. Tente novamente.')}
  finally{setBusy(false)}
 }

 return <form className="login-form" onSubmit={passwordLogin}>
  <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label>
  <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {notice&&<p role="status" className="admin-success">{notice}</p>}
  <button type="submit" className="primary login-action" disabled={busy||!password}>{busy?'Processando…':'Entrar com senha'}</button>
  <button type="button" className="secondary login-action" disabled={busy||!email.trim()} onClick={()=>void emailLink()}>Enviar link de acesso</button>
 </form>;
}
