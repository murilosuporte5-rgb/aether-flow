'use client';
import {useState} from 'react';
import {createClient} from '@/lib/supabase/browser';
import {templates,type TemplateKey} from '@/lib/templates';

export default function AdminForm(){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [template,setTemplate]=useState<TemplateKey>('generic');
 const [busy,setBusy]=useState(false);
 const [result,setResult]=useState('');
 const [error,setError]=useState('');

 async function submit(e:React.FormEvent){
  e.preventDefault();
  setBusy(true);setResult('');setError('');
  try{
   const supabase=createClient();
   const {data,error}=await supabase.functions.invoke('create-access',{
    body:{email:email.trim().toLowerCase(),password,name:name.trim(),template}
   });
   if(error)throw error;
   if(data?.error)throw new Error(data.error);
   setResult(`Acesso criado. Cliente: ${email.trim().toLowerCase()} · entra com a senha definida acima.`);
   setEmail('');setPassword('');setName('');setTemplate('generic');
  }catch(e){
   setError(e instanceof Error?e.message:'Não foi possível criar o acesso.');
  }finally{setBusy(false)}
 }

 return <form className="admin-form" onSubmit={submit}>
  <label>E-mail do cliente
   <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off"/>
  </label>
  <label>Senha inicial
   <input required type="text" minLength={8} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="off" placeholder="Mínimo de 8 caracteres"/>
  </label>
  <label>Empresa <small>(opcional)</small>
   <input maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Se vazio, usamos o nome do e-mail"/>
  </label>
  <label>Segmento <small>(opcional)</small>
   <select value={template} onChange={e=>setTemplate(e.target.value as TemplateKey)}>
    {Object.entries(templates).map(([key,val])=><option key={key} value={key}>{val.label}</option>)}
   </select>
  </label>
  <button className="primary" disabled={busy}>{busy?'Criando acesso…':'Criar acesso'}</button>
  {result&&<p role="status" className="admin-success">{result}</p>}
  {error&&<p role="alert" className="form-error">{error}</p>}
  <p className="panel-footnote">Nenhum e-mail é enviado. O usuário é criado já confirmado e entra diretamente com e-mail + senha.</p>
 </form>;
}
