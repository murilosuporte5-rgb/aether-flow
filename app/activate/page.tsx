import ActivateForm from './form';
import ResetPasswordForm from './reset-form';
import { AetherMark } from '../aether-logo';

export default async function Activate({searchParams}:{searchParams:Promise<{mode?:string}>}){
 const params=await searchParams;
 const recovery=params.mode==='recovery';
 return <main className="login"><div className="login-card"><AetherMark size={44} /><div className="eyebrow">ACESSO INDIVIDUAL</div><h1>{recovery?'Crie uma nova senha.':'Defina sua senha.'}</h1><p>{recovery?'Escolha uma senha forte para voltar ao seu ambiente com segurança.':'Esta senha será usada nos próximos acessos à sua empresa.'}</p>{recovery?<ResetPasswordForm/>:<ActivateForm/>}</div></main>
}
