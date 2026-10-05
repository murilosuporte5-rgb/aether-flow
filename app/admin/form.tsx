'use client';
import {useState} from 'react';
import {Check,Copy,Eye,EyeOff,RefreshCw,Sparkles} from 'lucide-react';
import {FunctionsHttpError} from '@supabase/supabase-js';
import {createClient} from '@/lib/supabase/browser';
import {templates,type TemplateKey} from '@/lib/templates';

type CreatedAccess={clientName:string;email:string;password:string;company:string};

function randomPassword(){
 const upper='ABCDEFGHJKLMNPQRSTUVWXYZ';
 const lower='abcdefghijkmnopqrstuvwxyz';
 const digits='23456789';
 const symbols='!@#$%&*?';
 const all=upper+lower+digits+symbols;
 const pick=(chars:string)=>chars[crypto.getRandomValues(new Uint32Array(1))[0]%chars.length];
 const seed=[pick(upper),pick(lower),pick(digits),pick(symbols)];
 while(seed.length<16)seed.push(pick(all));
 for(let i=seed.length-1;i>0;i--){
  const j=crypto.getRandomValues(new Uint32Array(1))[0]%(i+1);
  [seed[i],seed[j]]=[seed[j],seed[i]];
 }
 return seed.join('');
}

export default function AdminForm(){
 const [clientName,setClientName]=useState('');
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [showPassword,setShowPassword]=useState(false);
 const [companyName,setCompanyName]=useState('');
 const [template,setTemplate]=useState<TemplateKey>('generic');
 const [busy,setBusy]=useState(false);
 const [created,setCreated]=useState<CreatedAccess|null>(null);
 const [copied,setCopied]=useState(false);
 const [error,setError]=useState('');

 function generatePassword(){
  setPassword(randomPassword());
  setShowPassword(true);
  setError('');
 }

 async function copyAccess(){
  if(!created)return;
  const message=`Aether Flow\nCliente: ${created.clientName}\nLogin: ${created.email}\nSenha: ${created.password}\nAcesso: ${window.location.origin}/login`;
  try{
   await navigator.clipboard.writeText(message);
   setCopied(true);
   window.setTimeout(()=>setCopied(false),1800);
  }catch{
   setError('Não consegui copiar automaticamente. Copie os dados abaixo manualmente.');
  }
 }

 async function submit(e:React.FormEvent){
  e.preventDefault();
  setCreated(null);setCopied(false);setError('');

  const cleanClientName=clientName.trim();
  if(cleanClientName.length<2){
   setError('Informe o nome do cliente.');
   return;
  }
  if(password.length<12){
   setError('Use uma senha com pelo menos 12 caracteres.');
   return;
  }

  setBusy(true);
  try{
   const cleanEmail=email.trim().toLowerCase();
   const cleanCompanyName=companyName.trim();
   const supabase=createClient();
   const {data,error}=await supabase.functions.invoke('create-access',{
    body:{email:cleanEmail,password,clientName:cleanClientName,companyName:cleanCompanyName,template}
   });

   if(error instanceof FunctionsHttpError){
    let message='Não foi possível criar o acesso.';
    try{
     const payload=await error.context.json() as {error?:string};
     if(payload?.error)message=payload.error;
    }catch{}
    throw new Error(message);
   }
   if(error)throw error;
   if(data?.error)throw new Error(data.error);

   setCreated({
    clientName:data?.clientName||cleanClientName,
    email:cleanEmail,
    password,
    company:data?.companyName||cleanCompanyName||cleanClientName
   });
   setClientName('');setEmail('');setPassword('');setCompanyName('');setTemplate('generic');setShowPassword(false);
  }catch(e){
   setError(e instanceof Error?e.message:'Não foi possível criar o acesso.');
  }finally{setBusy(false)}
 }

 return <div className="admin-form-wrap">
  <form className="admin-form admin-form-v2" onSubmit={submit}>
   <div className="admin-fields-grid">
    <label>
     <span>Nome do cliente</span>
     <input required maxLength={100} value={clientName} onChange={e=>setClientName(e.target.value)} autoComplete="off" placeholder="Ex.: João Silva"/>
    </label>

    <label>
     <span>E-mail do cliente</span>
     <input required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off" placeholder="joao@empresa.com"/>
    </label>

    <label className="field-wide">
     <span>Senha inicial <small>mínimo 12 caracteres</small></span>
     <div className="password-control">
      <input required type={showPassword?'text':'password'} minLength={12} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="Crie ou gere uma senha segura"/>
      <button type="button" className="field-icon-btn" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button>
     </div>
     <button type="button" className="generate-password" onClick={generatePassword}><Sparkles size={15}/> Gerar senha forte</button>
    </label>

    <label>
     <span>Empresa <small>opcional</small></span>
     <input maxLength={120} value={companyName} onChange={e=>setCompanyName(e.target.value)} placeholder="Ex.: Horizonte Eventos"/>
    </label>

    <label>
     <span>Segmento <small>opcional</small></span>
     <select value={template} onChange={e=>setTemplate(e.target.value as TemplateKey)}>
      {Object.entries(templates).map(([key,val])=><option key={key} value={key}>{val.label}</option>)}
     </select>
    </label>
   </div>

   {error&&<div role="alert" className="form-error admin-form-error">{error}</div>}

   <div className="admin-form-footer">
    <div className="admin-security-note"><Check size={15}/> Sem e-mail de confirmação. A conta já nasce pronta.</div>
    <button className="primary admin-create-button" disabled={busy}>{busy?<><RefreshCw className="spin" size={16}/> Criando acesso…</>:<><Check size={16}/> Criar acesso</>}</button>
   </div>
  </form>

  {created&&<section className="access-success" role="status">
   <div className="access-success-icon"><Check size={22}/></div>
   <div className="access-success-main">
    <span>ACESSO CRIADO</span>
    <h3>{created.clientName}</h3>
    {created.company&&created.company!==created.clientName&&<p className="access-company">{created.company}</p>}
    <div className="credential-row"><small>E-mail</small><strong>{created.email}</strong></div>
    <div className="credential-row"><small>Senha</small><strong>{created.password}</strong></div>
    <div className="success-actions">
     <button type="button" className="primary" onClick={()=>void copyAccess()}>{copied?<><Check size={16}/> Copiado</>:<><Copy size={16}/> Copiar acesso</>}</button>
     <a className="secondary" href="/login" target="_blank" rel="noreferrer">Testar login</a>
    </div>
   </div>
  </section>}
 </div>;
}
