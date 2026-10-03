"use client";

import Image from "next/image";
import { ArrowRight, Check, Smartphone } from "lucide-react";
import { useEffect, useState } from "react";

const shots = [
  { src: "/demo/panel-v2.png", label: "Painel real", text: "Veja primeiro o que pede atenção." },
  { src: "/demo/alerts-v2.png", label: "Alertas reais", text: "Prioridades aparecem em ordem de urgência." },
  { src: "/demo/contacts-v2.png", label: "Contatos reais", text: "Dados, histórico e responsável no mesmo lugar." },
  { src: "/demo/pipeline-v2.png", label: "Pipeline real", text: "Acompanhe cada negociação até o resultado." },
  { src: "/demo/messages-v2.png", label: "Mensagens reais", text: "Use contexto e modelos sem perder o ritmo." },
  { src: "/demo/data-v2.png", label: "Dados reais", text: "Métricas e CSV prontos para acompanhar." },
  { src: "/demo/team-v2.png", label: "Equipe real", text: "Funções e responsáveis ficam visíveis." },
];

export default function LandingMobileProof() {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  useEffect(() => {
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (reducedMotion.matches || paused) return;
    const timer = window.setInterval(() => {
      if (!document.hidden) setActive((current) => (current + 1) % shots.length);
    }, 6000);
    return () => window.clearInterval(timer);
  }, [paused]);
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
      <div className="landing-mobile-stage" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)} onFocusCapture={() => setPaused(true)} onBlurCapture={(event) => { if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setPaused(false); }}>
        <div className="landing-proof-device"><span className="landing-phone-speaker" aria-hidden="true"/><div key={shot.src} className="landing-mobile-shot"><Image src={shot.src} alt={`${shot.label} do Aether Flow`} width={1440} height={980} sizes="(max-width: 700px) 82vw, 300px" /></div></div>
        <div className="landing-mobile-caption"><span className="mobile-caption-icon"><Smartphone size={15} /></span><div><strong>{shot.label}</strong><small>{shot.text}</small></div></div>
        <div className="landing-mobile-dots" role="tablist" aria-label="Capturas do celular">{shots.map((item, index) => <button key={item.src} type="button" role="tab" aria-selected={index === active} aria-label={item.label} className={index === active ? "active" : ""} onClick={() => { setActive(index); setPaused(true); }} />)}</div>
      </div>
    </section>
  );
}
