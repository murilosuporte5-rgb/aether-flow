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
  }catch{setError('Não foi possível entrar. Verifique e-mail e senha.')}
  finally{setBusy(false)}
 }

 async function signUp(){
  const clean=cleanEmail();
  if(!/^\S+@\S+\.\S+$/.test(clean)){setError('Informe um e-mail válido.');return}
  if(password.length<8){setError('Crie uma senha com pelo menos 8 caracteres.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const {data,error}=await createClient().auth.signUp({
    email:clean,
    password,
    options:{emailRedirectTo:`${window.location.origin}/auth/confirm?next=/`}
   });
   if(error)throw error;
   if(data.session){router.replace('/');router.refresh();return}
   setNotice('Acesso criado. Se o Supabase pedir confirmação, abra o e-mail recebido e depois entre com sua senha.');
  }catch{setError('Não foi possível criar o acesso. Tente outro e-mail ou entre se a conta já existir.')}
  finally{setBusy(false)}
 }

 async function emailLink(){
  const clean=cleanEmail();
  if(!/^\S+@\S+\.\S+$/.test(clean)){setError('Informe um e-mail válido.');return}
  setBusy(true);setError('');setNotice('');
  try{
   const {error}=await createClient().auth.signInWithOtp({
    email:clean,
    options:{emailRedirectTo:`${window.location.origin}/auth/confirm?next=/`,shouldCreateUser:true}
   });
   if(error)throw error;
   setNotice('Link enviado. Abra o e-mail neste dispositivo para entrar.');
  }catch{setError('Não foi possível enviar o link de acesso. Tente novamente.')}
  finally{setBusy(false)}
 }

 return <form className="login-form" onSubmit={passwordLogin}>
  <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" required/></label>
  <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" minLength={8}/></label>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {notice&&<p role="status" className="admin-success">{notice}</p>}
  <button type="submit" className="primary login-action" disabled={busy||!password}>{busy?'Processando…':'Entrar com senha'}</button>
  <button type="button" className="secondary login-action" disabled={busy||!email.trim()||password.length<8} onClick={()=>void signUp()}>Criar meu acesso</button>
  <button type="button" className="secondary login-action" disabled={busy||!email.trim()} onClick={()=>void emailLink()}>Receber link por e-mail</button>
 </form>;
}
