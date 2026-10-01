"use client";

import { BarChart3, Bell, Check, MessageCircle, Target, Users, Workflow } from "lucide-react";
import { useState } from "react";

const screens = [
  { label: "O painel", icon: BarChart3, title: "O que merece atenção agora", tone: "blue", lines: [["Retorno vencido", "Mariana Souza · há 2 dias", "Agir agora"], ["Ação para hoje", "Empresa Horizonte · ligação", "Hoje"], ["Sem próximo passo", "Lucas Oliveira · revisar", "Revisar"]] },
  { label: "Alertas", icon: Bell, title: "Nenhum compromisso fica escondido", tone: "amber", lines: [["Retorno vencido", "1 oportunidade precisa de atenção", "Agir"], ["Ação para hoje", "2 compromissos aguardam execução", "Hoje"], ["Sem próxima ação", "1 contato precisa de uma decisão", "Revisar"]] },
  { label: "O radar", icon: Target, title: "Uma fila ordenada pela urgência", tone: "amber", lines: [["Vencidas", "1 oportunidade precisa de retorno", "1"], ["Para hoje", "2 ações com compromisso", "2"], ["Sem próximo passo", "1 conversa sem data", "1"]] },
  { label: "Contatos", icon: Users, title: "Cada pessoa com seu histórico", tone: "cyan", lines: [["Mariana Souza", "(71) 98868-0779 · 1 oportunidade", "Abrir"], ["Empresa Horizonte", "(71) 98868-0780 · 2 oportunidades", "Abrir"], ["Lucas Oliveira", "(71) 98868-0781 · 1 oportunidade", "Abrir"]] },
  { label: "Pipeline", icon: Workflow, title: "Oportunidades em cada etapa", tone: "violet", lines: [["Novo", "2 oportunidades · R$ 6.900", "2"], ["Proposta", "1 oportunidade · R$ 4.800", "1"], ["Fechado", "1 ganho · R$ 9.600", "1"]] },
  { label: "Mensagens", icon: MessageCircle, title: "Fale com contexto em poucos cliques", tone: "green", lines: [["Retorno de proposta", "Olá, Mariana. Posso tirar alguma dúvida?", "Usar"], ["Acompanhamento", "Passando para saber como ficou a decisão.", "Usar"], ["Próximo passo", "Combinamos uma conversa para amanhã?", "Usar"]] },
  { label: "Equipe", icon: Users, title: "Responsáveis claros para cada contato", tone: "slate", lines: [["João Oliveira", "2 oportunidades · 1 ação hoje", "Em dia"], ["Ana Costa", "1 oportunidade · sem atraso", "Em dia"], ["Murilo Suporte", "Administrador · acesso total", "Admin"]] },
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
        <div className="gallery-screen-content">{screen.lines.map(([title, detail, action]) => <div className="gallery-row" key={title}><span className="gallery-row-dot" /><div><strong>{title}</strong><small>{detail}</small></div><button type="button">{action}</button></div>)}</div>
        <div className="gallery-screen-footer"><Check size={14} /> Dados da sua empresa, separados e com histórico</div>
      </div>
    </div>
  );
}
