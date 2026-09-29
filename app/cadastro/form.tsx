'use client';
import {useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

export default function SignupForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[busy,setBusy]=useState(false),[error,setError]=useState(''),[notice,setNotice]=useState('');
 const router=useRouter();

 async function submit(e:React.FormEvent){
  e.preventDefault();setError('');setNotice('');
  const clean=email.trim().toLowerCase();
  if(!/^\S+@\S+\.\S+$/.test(clean)){setError('Informe um e-mail válido.');return}
  if(password.length<8){setError('Use uma senha com pelo menos 8 caracteres.');return}
  if(password!==confirm){setError('As senhas não coincidem.');return}
  setBusy(true);
  try{
   const {data,error}=await createClient().auth.signUp({
    email:clean,
    password,
    options:{emailRedirectTo:`${window.location.origin}/auth/confirm?next=/`}
   });
   if(error)throw error;
   if(data.session){router.replace('/');router.refresh();return}
   setNotice('Conta criada. Confirme o e-mail recebido para entrar e configurar sua empresa.');
  }catch(e){
   const message=e instanceof Error?e.message:'';
   setError(/signup|not allowed/i.test(message)?'O cadastro ainda não está liberado neste ambiente.':'Não foi possível criar a conta. Verifique os dados e tente novamente.');
  }finally{setBusy(false)}
 }

 return <form className="login-form" onSubmit={submit}>
  <label>E-mail<input type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="email" required/></label>
  <label>Senha<input type="password" value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" minLength={8} required/></label>
  <label>Confirmar senha<input type="password" value={confirm} onChange={e=>setConfirm(e.target.value)} autoComplete="new-password" minLength={8} required/></label>
  {error&&<p role="alert" className="form-error">{error}</p>}
  {notice&&<p role="status" className="admin-success">{notice}</p>}
  <button className="primary login-action" disabled={busy}>{busy?'Criando conta…':'Criar conta'}</button>
  <a className="secondary login-action" href="/entrar">Já tenho conta</a>
 </form>;
}
