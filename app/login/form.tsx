'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const router=useRouter();

 async function passwordLogin(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const {error}=await createClient().auth.signInWithPassword({email:email.trim().toLowerCase(),password});
   if(error)throw error;
   router.replace('/');router.refresh();
  }catch{setError('E-mail ou senha inválidos.')}
  finally{setBusy(false)}
 }

 return <form className="login-form" onSubmit={passwordLogin}>
  <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label>
  <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" required/></label>
  {error&&<p role="alert" className="form-error">{error}</p>}
  <button type="submit" className="primary login-action" disabled={busy}>{busy?'Entrando…':'Entrar'}</button>
  <a className="secondary login-action" href="/cadastro">Criar conta</a>
 </form>;
}
