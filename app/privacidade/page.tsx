import Link from "next/link";
import { AetherMark } from "../aether-logo";

export const dynamic = "force-static";

export default function PrivacyPage() {
  return <main className="legal-page"><article className="legal-card">
    <div className="legal-brand"><AetherMark /><strong>Aether Flow</strong></div>
    <span className="eyebrow">PRIVACIDADE</span>
    <h1>Como tratamos os dados do ambiente</h1>
    <p>Esta página explica quais dados o Aether Flow usa para autenticar pessoas, organizar a operação comercial e manter o histórico solicitado pela empresa.</p>
    <h2>Dados tratados</h2>
    <p>Podemos tratar nome, e-mail, telefone, empresa, função, oportunidades, atividades, mensagens internas, registros de acesso e informações de operação inseridas pela equipe. A extensão Aether Capture tenta ler somente nome e telefone disponíveis na conversa aberta do WhatsApp Web.</p>
    <h2>Finalidades e base</h2>
    <p>Usamos os dados para criar e proteger contas, executar o serviço contratado, registrar ações, atender solicitações, prevenir abuso e cumprir obrigações legais. A empresa administradora define quais dados inserir e permanece responsável pela base legal de seus contatos.</p>
    <h2>Isolamento e acesso</h2>
    <p>Cada empresa possui ambiente separado. Pessoas da equipe acessam apenas o que suas permissões permitem; administradores gerenciam integrantes vinculados à própria empresa. Não vendemos dados pessoais nem usamos os contatos para publicidade de terceiros.</p>
    <h2>Compartilhamento e provedores</h2>
    <p>Podemos usar provedores de hospedagem, banco de dados, autenticação e envio de e-mail estritamente para operar o serviço. Eles recebem apenas o necessário. Não enviamos mensagens de WhatsApp automaticamente.</p>
    <h2>Retenção e segurança</h2>
    <p>Guardamos registros enquanto a empresa precisar do serviço ou enquanto houver obrigação legal, depois aplicando exclusão ou anonimização quando possível. Usamos autenticação, controle por empresa, limites de requisição e histórico de alterações.</p>
    <h2>Direitos e solicitações</h2>
    <p>A pessoa pode solicitar confirmação, acesso, correção, exportação ou exclusão por meio do administrador da empresa ou do canal de suporte da Aether Works. A solicitação pode exigir confirmação de identidade e análise de obrigações de retenção.</p>
    <h2>Cookies e alterações</h2>
    <p>Usamos armazenamento técnico necessário para manter a sessão e preferências básicas, sem cookies de publicidade comportamental. Esta política pode ser atualizada; a versão vigente e sua data ficam nesta página.</p>
    <p className="legal-updated">Versão publicada em 03/10/2026. Este texto é informativo e não substitui orientação jurídica específica.</p>
    <Link className="secondary" href="/landing">Voltar para a landing</Link>
  </article></main>;
}
