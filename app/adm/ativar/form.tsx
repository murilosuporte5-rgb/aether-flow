'use client';
import {useState} from 'react';

export default function ActivationForm({claimKey}:{claimKey:string}){
 const [busy,setBusy]=useState(false),[error,setError]=useState('');
 async function activate(){
  setBusy(true);setError('');
  try{
   const r=await fetch('/api/admin/claim',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({key:claimKey})});
   const j=await r.json() as {error?:string};
   if(!r.ok)throw new Error(j.error||'Falha ao ativar');
   window.location.assign('/admin');
  }catch(e){setError(e instanceof Error?e.message:'Falha ao ativar administrador')}
  finally{setBusy(false)}
 }
 return <div className="login-form">
  <p>Você está autenticado. Este link transforma esta conta no primeiro administrador da Aether Flow e deixa de funcionar após o uso.</p>
  {error&&<p className="form-error" role="alert">{error}</p>}
  <button className="primary login-action" disabled={busy} onClick={()=>void activate()}>{busy?'Ativando…':'Ativar meu acesso ADM'}</button>
 </div>;
}
