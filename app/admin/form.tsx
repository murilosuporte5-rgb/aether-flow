'use client';
import {useMemo,useState} from 'react';
import {Check,Copy,Eye,EyeOff,RefreshCw,Sparkles} from 'lucide-react';
import {FunctionsHttpError} from '@supabase/supabase-js';
import {createClient} from '@/lib/supabase/browser';
import {templates,type TemplateKey} from '@/lib/templates';

type CreatedAccess={email:string,password:string,company:string};

const makePassword=()=>{
 const chars='ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz23456789!@#$%';
 const bytes=new Uint32Array(16);
 crypto.getRandomValues(bytes);
 return Array.from(bytes,n=>chars[n%chars.length]).join('');
};

export default function AdminForm({loginUrl}:{loginUrl:string}){
 const [email,setEmail]=useState('');
 const [password,setPassword]=useState('');
 const [name,setName]=useState('');
 const [template,setTemplate]=useState<TemplateKey>('generic');
 const [showPassword,setShowPassword]=useState(false);
 const [busy,setBusy]=useState(false);
 const [created,setCreated]=useState<CreatedAccess|null>(null);
 const [error,setError]=useState('');
 const [copied,setCopied]=useState(false);

 const passwordOk=password.length>=12;
 const canSubmit=useMemo(()=>email.trim().length>3&&passwordOk&&!busy,[email,passwordOk,busy]);

 function generatePassword(){
  const next=makePassword();
  setPassword(next);
  setShowPassword(true);
  setError('');
 }

 async function copyAccess(access=created){
  if(!access)return;
  const message=`Aether Flow\nLink: ${loginUrl}\nE-mail: ${access.email}\nSenha: ${access.password}`;
  try{
   await navigator.clipboard.writeText(message);
   setCopied(true);
   window.setTimeout(()=>setCopied(false),1800);
  }catch{
   setError('Não consegui copiar automaticamente. Selecione os dados abaixo e copie manualmente.');
  }
 }

 function reset(){
  setEmail('');setPassword('');setName('');setTemplate('generic');setCreated(null);setError('');setCopied(false);setShowPassword(false);
 }

 async function submit(e:React.FormEvent){
  e.preventDefault();setCreated(null);setError('');
  if(password.length<12){setError('A senha precisa ter pelo menos 12 caracteres.');return}

  const cleanEmail=email.trim().toLowerCase();
  const cleanName=name.trim();
  setBusy(true);
  try{
   const supabase=createClient();
   const {data,error}=await supabase.functions.invoke('create-access',{
    body:{email:cleanEmail,password,name:cleanName,template}
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

   setCreated({email:cleanEmail,password,company:cleanName||data?.companyName||'Ambiente do cliente'});
  }catch(e){
   setError(e instanceof Error?e.message:'Não foi possível criar o acesso.');
  }finally{setBusy(false)}
 }

 if(created){
  return <div className="access-success">
   <div className="success-mark"><Check size={23}/></div>
   <div className="success-title">
    <span>ACESSO CRIADO</span>
    <h3>Pronto para enviar ao cliente</h3>
    <p>A conta já está confirmada. Não é necessário abrir e-mail.</p>
   </div>
   <div className="credential-box">
    <div><span>Link</span><strong>{loginUrl.replace('https://','')}</strong></div>
    <div><span>E-mail</span><strong>{created.email}</strong></div>
    <div><span>Senha</span><strong>{created.password}</strong></div>
   </div>
   <button type="button" className="primary access-copy" onClick={()=>void copyAccess()}>
    {copied?<><Check size={17}/> Copiado</>:<><Copy size={17}/> Copiar dados para enviar</>}
   </button>
   <button type="button" className="text-action" onClick={reset}>Criar outro acesso</button>
   {error&&<p role="alert" className="form-error">{error}</p>}
  </div>;
 }

 return <form className="admin-form admin-form-v2" onSubmit={submit}>
  <div className="field-group">
   <label htmlFor="client-email">E-mail do cliente</label>
   <input id="client-email" required type="email" value={email} onChange={e=>setEmail(e.target.value)} autoComplete="off" placeholder="cliente@empresa.com"/>
  </div>

  <div className="field-group">
   <div className="field-label-row">
    <label htmlFor="client-password">Senha inicial</label>
    <button type="button" className="generate-password" onClick={generatePassword}><Sparkles size={14}/> Gerar senha</button>
   </div>
   <div className="password-field">
    <input id="client-password" required type={showPassword?'text':'password'} minLength={12} value={password} onChange={e=>setPassword(e.target.value)} autoComplete="new-password" placeholder="Mínimo de 12 caracteres"/>
    <button type="button" onClick={()=>setShowPassword(v=>!v)} aria-label={showPassword?'Ocultar senha':'Mostrar senha'}>{showPassword?<EyeOff size={17}/>:<Eye size={17}/>}</button>
   </div>
   <div className={`password-hint ${password.length&&passwordOk?'ok':''}`}>
    <span>{password.length?password.length:0}/12 caracteres</span>
    {passwordOk&&<span><Check size={12}/> Pronta para uso</span>}
   </div>
  </div>

  <div className="admin-form-grid">
   <div className="field-group">
    <label htmlFor="company-name">Empresa <small>opcional</small></label>
    <input id="company-name" maxLength={120} value={name} onChange={e=>setName(e.target.value)} placeholder="Nome da empresa"/>
   </div>
   <div className="field-group">
    <label htmlFor="company-template">Segmento <small>opcional</small></label>
    <select id="company-template" value={template} onChange={e=>setTemplate(e.target.value as TemplateKey)}>
     {Object.entries(templates).map(([key,val])=><option key={key} value={key}>{val.label}</option>)}
    </select>
   </div>
  </div>

  {error&&<p role="alert" className="form-error">{error}</p>}

  <button className="primary admin-submit" disabled={!canSubmit}>
   {busy?<><RefreshCw className="spin" size={17}/> Criando acesso…</>:<>Criar acesso</>}
  </button>
  <p className="admin-note"><Check size={14}/> Sem convite e sem confirmação por e-mail.</p>
 </form>;
}
