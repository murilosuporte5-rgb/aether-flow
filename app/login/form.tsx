'use client';
import {useState} from 'react';
import {Eye,EyeOff,LogIn} from 'lucide-react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';

export default function LoginForm(){
 const [email,setEmail]=useState(''),[password,setPassword]=useState(''),[show,setShow]=useState(false),[busy,setBusy]=useState(false),[error,setError]=useState('');
 const router=useRouter();

 async function passwordLogin(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const {error}=await createClient().auth.signInWithPassword({email:email.trim().toLowerCase(),password});
   if(error)throw error;
   router.replace('/');router.refresh();
  }catch{setError('E-mail ou senha não conferem. Verifique os dados e tente novamente.')}
  finally{setBusy(false)}
 }

 return <form className="login-form login-form-v2" onSubmit={passwordLogin}>
  <div className="field-group">
   <label htmlFor="login-email">E-mail</label>
   <input id="login-email" type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="username" placeholder="voce@empresa.com" required/>
  </div>
  <div className="field-group">
   <label htmlFor="login-password">Senha</label>
   <div className="password-field">
    <input id="login-password" type={show?'text':'password'} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="current-password" placeholder="Sua senha" required/>
    <button type="button" onClick={()=>setShow(v=>!v)} aria-label={show?'Ocultar senha':'Mostrar senha'}>{show?<EyeOff size={17}/>:<Eye size={17}/>}</button>
   </div>
  </div>
  {error&&<p role="alert" className="form-error">{error}</p>}
  <button type="submit" className="primary login-action" disabled={busy||!email||!password}>
   <LogIn size={17}/>{busy?'Entrando…':'Entrar'}
  </button>
 </form>;
}
