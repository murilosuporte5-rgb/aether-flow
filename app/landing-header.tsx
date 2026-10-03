"use client";

import { Menu, X } from "lucide-react";
import { useState } from "react";
import { AetherMark } from "./aether-logo";
import { trialWhatsAppUrl } from "./landing-cta";

export default function LandingHeader() {
  const [menuOpen, setMenuOpen] = useState(false);
  const closeMenu = () => setMenuOpen(false);

  return (
    <header className="landing-nav">
      <a className="landing-brand" href="#topo" aria-label="Aether Flow, início" onClick={closeMenu}>
        <AetherMark />
        <span><strong>Aether Flow</strong><small>RADAR DE OPORTUNIDADES</small></span>
      </a>
      <nav className={`landing-links${menuOpen ? " is-open" : ""}`} id="landing-navigation" aria-label="Navegação principal">
        <a href="/landing/como-funciona" onClick={closeMenu}>Como funciona</a>
        <a href="/landing/para-quem" onClick={closeMenu}>Para quem é</a>
        <a href="/landing/telas" onClick={closeMenu}>Telas reais</a>
        <a href="/landing/recursos" onClick={closeMenu}>Recursos</a>
        <a href="/landing/preco" onClick={closeMenu}>Preço</a>
        <a href="/landing/duvidas" onClick={closeMenu}>Dúvidas</a>
        <a className="landing-mobile-action" href="/login" onClick={closeMenu}>Entrar</a>
        <a className="landing-mobile-action landing-mobile-cta" href={trialWhatsAppUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Teste grátis por 7 dias</a>
      </nav>
      <div className="landing-nav-actions">
        <a className="landing-login" href="/login" onClick={closeMenu}>Entrar</a>
        <a className="landing-nav-cta" href={trialWhatsAppUrl} target="_blank" rel="noreferrer" onClick={closeMenu}>Teste grátis por 7 dias</a>
      </div>
      <button className="landing-menu-toggle" type="button" aria-label={menuOpen ? "Fechar menu" : "Abrir menu"} aria-expanded={menuOpen} aria-controls="landing-navigation" onClick={() => setMenuOpen((open) => !open)}>
        {menuOpen ? <X size={21} /> : <Menu size={21} />}
      </button>
    </header>
  );
}
