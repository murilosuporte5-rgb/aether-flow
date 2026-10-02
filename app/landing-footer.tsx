import { AetherMark } from "./aether-logo";

export default function LandingFooter() {
  return (
    <footer className="landing-footer-v2">
      <div className="landing-footer-brand">
        <a className="landing-brand" href="#topo" aria-label="Aether Flow, voltar ao início">
          <AetherMark />
          <span><strong>Aether Flow</strong><small>AETHER WORKS</small></span>
        </a>
        <p>Radar de oportunidades para equipes que precisam agir no momento certo.</p>
      </div>
      <nav aria-label="Produto">
        <strong>Produto</strong>
        <a href="#como-funciona">Como funciona</a>
        <a href="#produto">Telas reais</a>
        <a href="#recursos">Recursos</a>
      </nav>
      <nav aria-label="Operação">
        <strong>Operação</strong>
        <a href="#para-quem">Para quem é</a>
        <a href="#equipe">Equipe</a>
        <a href="#plano">Plano</a>
      </nav>
      <nav aria-label="Acesso">
        <strong>Acesso</strong>
        <a href="/login">Entrar</a>
        <a href="/termos">Termos de uso</a>
        <a href="/privacidade">Privacidade</a>
        <a href="#duvidas">Dúvidas frequentes</a>
      </nav>
      <div className="landing-footer-bottom"><span>© 2026 Aether Works</span><span>Aether Flow · Operação comercial</span></div>
    </footer>
  );
}
