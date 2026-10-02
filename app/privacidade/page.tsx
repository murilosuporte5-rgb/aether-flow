import Link from "next/link";
import { AetherMark } from "../aether-logo";

export default function PrivacyPage() {
  return <main className="legal-page"><div className="legal-card"><div className="legal-brand"><AetherMark /><strong>Aether Flow</strong></div><span className="eyebrow">PRIVACIDADE</span><h1>Seus dados ficam no ambiente da empresa</h1><p>Usamos os dados para autenticar usuários, organizar a operação comercial e registrar o histórico solicitado pela equipe. O acesso é limitado à empresa e à função de cada pessoa.</p><h2>Portabilidade</h2><p>Contatos e oportunidades podem ser exportados pelo administrador em CSV. Solicite a correção ou exclusão pelo responsável da sua empresa.</p><p className="legal-updated">Versão publicada em 02/10/2026.</p><Link className="secondary" href="/landing">Voltar para a landing</Link></div></main>;
}
