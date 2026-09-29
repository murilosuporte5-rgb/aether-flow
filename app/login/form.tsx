'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const router=useRouter();
 const cleanEmail=()=>email.trim().toLowerCase();

 async function passwordLogin(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');setNotice('');
  try{
   const {error}=await createClient().auth.signInWithPassword({email:cleanEmail(),password});
   if(error)throw error;
   router.replace('/');router.refresh();
  }catch{setError('Não foi possível entrar. Esta conta precisa existir no Aether Flow e a senha deve estar correta.')}
  finally{setBusy(false)}
 }

 async function emailLink(){
  const clean=cleanEmail();
  if(!/^\S+@\S+\.\S+$/.test(clean)){setError('Informe um e-mail válido.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const {error}=await createClient().auth.signInWithOtp({
    email:clean,
    options:{emailRedirectTo:`${window.location.origin}/auth/confirm?next=/`,shouldCreateUser:false}
   });
   if(error)throw error;
   setNotice('Se este e-mail já tiver acesso, o link de entrada será enviado.');
  }catch{setError('Não foi possível enviar o link. Confirme que este e-mail já foi cadastrado pela Aether Works.')}
  finally{setBusy(false)}
 }

 return <form className="login-form" onSubmit={passwordLogin}>
  <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label>
  <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password"/></label>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {notice&&<p role="status" className="admin-success">{notice}</p>}
  <button type="submit" className="primary login-action" disabled={busy||!password}>{busy?'Processando…':'Entrar com senha'}</button>
  <button type="button" className="secondary login-action" disabled={busy||!email.trim()} onClick={()=>void emailLink()}>Receber link por e-mail</button>
 </form>;
}
