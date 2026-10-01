"use client";

import { BarChart3, Bell, Check, Users, Workflow } from "lucide-react";
import { useState } from "react";

const screens = [
  { label: "O painel", view: "panel", icon: BarChart3, title: "O que merece atenção agora", tone: "blue" },
  { label: "Alertas", view: "alerts", icon: Bell, title: "Nenhum compromisso fica escondido", tone: "amber" },
  { label: "Contatos", view: "contacts", icon: Users, title: "Cada pessoa com seu histórico", tone: "cyan" },
  { label: "Pipeline", view: "pipeline", icon: Workflow, title: "Oportunidades em cada etapa", tone: "violet" },
  { label: "Equipe", view: "team", icon: Users, title: "Responsáveis claros para cada contato", tone: "slate" },
];

export default function LandingProductGallery() {
  const [active, setActive] = useState(0);
  const screen = screens[active];
  const Icon = screen.icon;
  return (
    <div className="landing-gallery" aria-label="Telas do Aether Flow">
      <div className="landing-gallery-tabs" role="tablist" aria-label="Telas do produto">
        {screens.map((item, index) => { const TabIcon = item.icon; return <button key={item.label} type="button" role="tab" aria-selected={index === active} className={index === active ? "active" : ""} onClick={() => setActive(index)}><TabIcon size={14} />{item.label}</button>; })}
      </div>
      <div className={`landing-gallery-screen ${screen.tone}`}>
        <div className="gallery-screen-head"><div><span>Aether Flow · visão real</span><h3>{screen.title}</h3></div><span className="gallery-screen-icon"><Icon size={18} /></span></div>
        <img className="gallery-real-shot" src={`/demo/${screen.view}.png`} alt={`Captura real do Aether Flow: ${screen.label}`} />
        <div className="gallery-screen-footer"><Check size={14} /> Dados da sua empresa, separados e com histórico</div>
      </div>
    </div>
  );
}
