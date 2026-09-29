'use client';
import {useEffect,useState} from 'react';
import {useRouter} from 'next/navigation';
import {createClient} from '@/lib/supabase/browser';
export default function ActivateForm(){
 const [password,setPassword]=useState(''),[confirm,setConfirm]=useState(''),[error,setError]=useState(''),[busy,setBusy]=useState(false),[ready,setReady]=useState(false);
 const router=useRouter();
 useEffect(()=>{
  const s=createClient();const hash=new URLSearchParams(window.location.hash.slice(1));
  const access=hash.get('access_token'),refresh=hash.get('refresh_token');
  void (async()=>{
   if(access&&refresh){const result=await s.auth.setSession({access_token:access,refresh_token:refresh});if(result.error){setError('Convite inválido ou expirado. Peça um novo convite.');return}history.replaceState({},'',location.pathname)}
   const {data:{user}}=await s.auth.getUser();setReady(!!user);if(!user)setError('Abra o link enviado ao seu e-mail para ativar o acesso.');
  })();
 },[]);
 async function activate(e:React.FormEvent){e.preventDefault();if(password!==confirm){setError('As senhas não conferem.');return}setBusy(true);setError('');try{const {error}=await createClient().auth.updateUser({password});if(error)throw error;router.replace('/');router.refresh()}catch{setError('Não foi possível definir a senha. Tente novamente.')}finally{setBusy(false)}}
 return <form className="login-form" onSubmit={activate}><label>Nova senha<input type="password" minLength={12} required autoComplete="new-password" value={password} onChange={e=>setPassword(e.target.value)}/></label><label>Confirmar senha<input type="password" minLength={12} required autoComplete="new-password" value={confirm} onChange={e=>setConfirm(e.target.value)}/></label>{error&&<p role="alert" className="form-error">{error}</p>}<button className="primary login-action" disabled={!ready||busy}>{busy?'Salvando…':'Ativar acesso'}</button></form>;
}
