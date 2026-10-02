"use client";

import Image from "next/image";
import { ArrowRight, Check, Monitor } from "lucide-react";
import { useEffect, useState } from "react";

const shots = [
  { src: "/demo/panel.png", label: "Painel real", text: "Veja primeiro o que pede atenção." },
  { src: "/demo/alerts.png", label: "Alertas reais", text: "Compromissos e prioridades no mesmo lugar." },
  { src: "/demo/team.png", label: "Equipe real", text: "Responsáveis e acessos sem desencontro." },
];

export default function LandingMobileProof() {
  const [active, setActive] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setActive((current) => (current + 1) % shots.length), 4200);
    return () => window.clearInterval(timer);
  }, []);
  const shot = shots[active];
  return (
    <section className="landing-mobile-proof" aria-labelledby="mobile-proof-title">
      <div className="landing-mobile-copy">
        <span className="landing-eyebrow">TAMBÉM NO CELULAR</span>
        <h2 id="mobile-proof-title">A operação acompanha sua equipe onde ela estiver.</h2>
        <p>Estas são capturas do próprio Aether Flow com dados de demonstração. O time pode agir, registrar e acompanhar sem apertar uma tela minúscula.</p>
        <div className="landing-mobile-signals"><span><Check size={15} /> Alertas e prioridades em primeiro plano</span><span><Check size={15} /> Tutorial rápido no primeiro acesso</span><span><Check size={15} /> Layout que se adapta ao toque</span></div>
        <a className="landing-secondary" href="/demo?view=panel#demo-screen">Abrir demonstração <ArrowRight size={16} /></a>
      </div>
      <div className="landing-mobile-stage">
        <div className="landing-proof-device"><div key={shot.src} className="landing-mobile-shot"><Image src={shot.src} alt={`${shot.label} do Aether Flow`} width={1440} height={980} sizes="(max-width: 700px) 100vw, 500px" /></div></div>
        <div className="landing-mobile-caption"><span className="mobile-caption-icon"><Monitor size={15} /></span><div><strong>{shot.label}</strong><small>{shot.text}</small></div><span className="mobile-caption-count">{active + 1}/{shots.length}</span></div>
        <div className="landing-mobile-dots" role="tablist" aria-label="Capturas do celular">{shots.map((item, index) => <button key={item.src} type="button" role="tab" aria-selected={index === active} aria-label={item.label} className={index === active ? "active" : ""} onClick={() => setActive(index)} />)}</div>
      </div>
    </section>
  );
}
