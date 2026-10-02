"use client";

import { BarChart3, Bell, Check, FileSpreadsheet, MessageCircle, Users, Workflow } from "lucide-react";
import Image from "next/image";
import { useState } from "react";

const screens = [
  { label: "O painel", view: "panel", imageHeight: 980, icon: BarChart3, title: "O que merece atenção agora", tone: "blue" },
  { label: "Alertas", view: "alerts", imageHeight: 980, icon: Bell, title: "Nenhum compromisso fica escondido", tone: "amber" },
  { label: "Contatos", view: "contacts", imageHeight: 980, icon: Users, title: "Cada pessoa com seu histórico", tone: "cyan" },
  { label: "Pipeline", view: "pipeline", imageHeight: 980, icon: Workflow, title: "Oportunidades em cada etapa", tone: "violet" },
  { label: "Mensagens", view: "messages", imageHeight: 900, icon: MessageCircle, title: "Respostas consistentes em poucos cliques", tone: "cyan" },
  { label: "Importar e exportar", view: "data", imageHeight: 900, icon: FileSpreadsheet, title: "Seus dados prontos para continuar", tone: "green" },
  { label: "Equipe", view: "team", imageHeight: 980, icon: Users, title: "Responsáveis claros para cada contato", tone: "slate" },
];

const liveStats: Record<string, [string, string, string]> = {
  panel: ["37 oportunidades", "R$ 182.000 em aberto", "25 abertas"],
  alerts: ["21 alertas", "8 vencidos", "7 para hoje"],
  contacts: ["42 contatos", "37 ativos", "18 retornos"],
  pipeline: ["37 oportunidades", "11 em proposta", "6 ganhos"],
  messages: ["24 mensagens", "11 modelos", "96% com contexto"],
  data: ["500 linhas", "42 oportunidades", "0 duplicadas"],
  team: ["3 responsáveis", "42 atendimentos", "100% atribuídos"],
};

export default function LandingProductGallery() {
  const [active, setActive] = useState(0);
  const screen = screens[active];
  const Icon = screen.icon;
  return (
    <div className="landing-gallery" aria-label="Telas do Aether Flow">
      <div className="landing-gallery-tabs" role="tablist" aria-label="Telas do produto">
        {screens.map((item, index) => { const TabIcon = item.icon; return <button key={item.label} id={`landing-gallery-tab-${item.view}`} type="button" role="tab" aria-controls="landing-gallery-panel" aria-selected={index === active} className={index === active ? "active" : ""} onClick={() => setActive(index)}><TabIcon size={14} />{item.label}</button>; })}
      </div>
      <div key={screen.view} id="landing-gallery-panel" role="tabpanel" aria-labelledby={`landing-gallery-tab-${screen.view}`} className={`landing-gallery-screen ${screen.tone}`}>
        <div className="gallery-screen-head"><div><span>Aether Flow · visão real</span><h3>{screen.title}</h3></div><span className="gallery-screen-icon"><Icon size={18} /></span></div>
        <div className="gallery-live-stats" aria-label="Indicadores da demonstração">{liveStats[screen.view].map((stat) => <span key={stat}><strong>{stat.split(" ", 1)[0]}</strong><small>{stat.slice(stat.indexOf(" ") + 1)}</small></span>)}</div>
        <Image className="gallery-real-shot" src={`/demo/${screen.view}-v2.png`} alt={`Captura real do Aether Flow: ${screen.label}`} width={1440} height={screen.imageHeight} sizes="(max-width: 700px) 100vw, 760px" />
        <div className="gallery-screen-footer"><Check size={14} /> Dados da sua empresa, separados e com histórico</div>
      </div>
    </div>
  );
}
