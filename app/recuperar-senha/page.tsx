import RecoveryForm from "./form";
import { AetherMark } from "../aether-logo";

export default function RecoveryPage() {
  return (
    <main className="login recovery-page">
      <div className="login-card recovery-card">
        <div className="auth-brand recovery-brand"><AetherMark size={36} /><strong>Aether Flow</strong></div>
        <div className="eyebrow">ACESSO INDIVIDUAL</div>
        <h1>Recuperar acesso</h1>
        <p>Informe o e-mail da sua conta. Se ele estiver cadastrado, enviaremos um link para criar uma nova senha.</p>
        <RecoveryForm />
        <a className="secondary login-action recovery-back" href="/login">Voltar para a entrada</a>
      </div>
    </main>
  );
}
