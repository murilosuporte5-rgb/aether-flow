'use client';
import {useState} from 'react';
import {templates,type TemplateKey} from '@/lib/templates';

export default function Onboarding({email,adminAccess}:{email:string,adminAccess:boolean}){
 const [companyName,setCompanyName]=useState(''),[template,setTemplate]=useState<TemplateKey>('generic'),[busy,setBusy]=useState(false),[error,setError]=useState('');

 async function submit(e:React.FormEvent){
  e.preventDefault();setBusy(true);setError('');
  try{
   const r=await fetch('/api/onboarding',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({companyName,template})});
   const j=await r.json() as {error?:string};
   if(!r.ok)throw new Error(j.error||'Falha ao criar empresa');
   window.location.assign('/');
  }catch(e){setError(e instanceof Error?e.message:'Não foi possível criar sua empresa.')}
  finally{setBusy(false)}
 }

 return <main className="login">
  <div className="login-card">
   <div className="brand-mark">A</div>
   <div className="eyebrow">AETHER FLOW · PRIMEIRO ACESSO</div>
   <h1>Configure sua empresa.</h1>
   <p>Leva menos de um minuto. Seu ambiente será criado separado dos demais clientes.</p>
   <form className="login-form" onSubmit={submit}>
    <label>Nome da empresa
     <input value={companyName} onChange={e=>setCompanyName(e.target.value)} maxLength={100} placeholder="Ex.: Horizonte Eventos" required/>
    </label>
    <label>Segmento
     <select value={template} onChange={e=>setTemplate(e.target.value as TemplateKey)}>
      {Object.entries(templates).map(([key,val])=><option key={key} value={key}>{val.label}</option>)}
     </select>
    </label>
    {error&&<p className="form-error" role="alert">{error}</p>}
    <button className="primary login-action" disabled={busy||companyName.trim().length<2}>{busy?'Criando ambiente…':'Criar meu ambiente'}</button>
   </form>
   <small>Conta: {email}</small>
   {adminAccess&&<a className="secondary login-action" href="/adm">Abrir administração</a>}
   <a href="/auth/signout">Sair desta conta</a>
  </div>
 </main>;
}
