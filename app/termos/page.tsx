import Link from "next/link";
import { AetherMark } from "../aether-logo";

export default function TermsPage() {
  return <main className="legal-page"><div className="legal-card"><div className="legal-brand"><AetherMark /><strong>Aether Flow</strong></div><span className="eyebrow">TERMOS DE USO</span><h1>Uso responsável do Aether Flow</h1><p>O Aether Flow organiza oportunidades, contatos, responsáveis e próximos passos da operação comercial. Você é responsável pelos dados inseridos e pelos acessos concedidos à sua equipe.</p><h2>Teste e cancelamento</h2><p>O acesso de teste dura 7 dias. O plano atual custa R$ 67 por mês por empresa e pode ser cancelado quando quiser, sem multa.</p><h2>Dados e segurança</h2><p>Cada empresa possui ambiente separado. Não compartilhe senhas, convites ou informações de clientes fora das pessoas autorizadas.</p><p className="legal-updated">Versão publicada em 02/10/2026.</p><Link className="secondary" href="/landing">Voltar para a landing</Link></div></main>;
}
