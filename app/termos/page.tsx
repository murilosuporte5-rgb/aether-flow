import Link from "next/link";
import { AetherMark } from "../aether-logo";

export const dynamic = "force-static";

export default function TermsPage() {
  return <main className="legal-page"><article className="legal-card">
    <div className="legal-brand"><AetherMark /><strong>Aether Flow</strong></div>
    <span className="eyebrow">TERMOS DE USO</span>
    <h1>Regras claras para usar o Aether Flow</h1>
    <p>Estes termos regulam o acesso ao Aether Flow, ferramenta de organização comercial da Aether Works. Ao criar uma conta ou usar o serviço, a pessoa administradora declara que tem autorização para representar a empresa e concorda com estas regras.</p>
    <h2>1. Conta e empresa</h2>
    <p>A conta deve usar dados verdadeiros, manter a senha protegida e informar qualquer acesso indevido. O administrador só pode convidar pessoas para a empresa que administra e deve revisar suas permissões.</p>
    <h2>2. Uso permitido</h2>
    <p>O serviço deve ser usado para organizar contatos, oportunidades, ações, mensagens revisadas e informações operacionais legítimas. É proibido inserir conteúdo ilícito, acessar outra empresa, explorar falhas, disparar mensagens em massa ou automatizar ações no WhatsApp sem consentimento.</p>
    <h2>3. Dados inseridos pela empresa</h2>
    <p>A empresa é responsável pela origem, exatidão e base legal dos dados inseridos, incluindo telefones, e-mails e anotações. O Aether Flow não confirma recebimento de valores nem substitui contratos, contabilidade, emissão fiscal ou aconselhamento jurídico.</p>
    <h2>4. Teste, preço e cancelamento</h2>
    <p>O teste inicial dura 7 dias. Depois, o plano informado no checkout custa R$ 67 por mês por empresa e pode ser cancelado quando quiser, sem multa. A cobrança só ocorre após o período de teste conforme as condições do checkout.</p>
    <h2>5. Disponibilidade e segurança</h2>
    <p>Aplicamos autenticação, isolamento por empresa, permissões e registro de ações, mas nenhum serviço conectado à internet é infalível. Podemos suspender acessos que ameacem pessoas, dados, infraestrutura ou outras empresas.</p>
    <h2>6. Propriedade e responsabilidade</h2>
    <p>A marca, o código e a interface pertencem à Aether Works. A empresa mantém seus dados e pode exportar contatos e oportunidades conforme os recursos disponíveis. O serviço não garante resultado comercial, conversão ou disponibilidade contínua.</p>
    <h2>7. Alterações e contato</h2>
    <p>Podemos atualizar estes termos para refletir mudanças no produto ou na lei. A versão vigente fica publicada nesta página. Dúvidas, solicitações ou avisos de segurança devem ser encaminhados ao canal de suporte informado pela Aether Works.</p>
    <p className="legal-updated">Versão publicada em 03/10/2026. Este texto é informativo e não substitui orientação jurídica específica.</p>
    <Link className="secondary" href="/landing">Voltar para a landing</Link>
  </article></main>;
}
