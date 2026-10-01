"use client";

import { BarChart3, BookOpen, Columns3, MessageCircle, Plus, Radar, Users } from "lucide-react";

type GuideTab = "today" | "list" | "pipeline" | "team";

type Props = {
  onSelectTab: (tab: GuideTab) => void;
  canManageTeam: boolean;
};

const items = [
  { title: "Radar", detail: "Comece em Hoje: a fila mostra o próximo retorno e o que está vencido.", icon: Radar, action: "Abrir Hoje", tab: "today" as const },
  { title: "Oportunidades", detail: "Registre uma venda e acompanhe cada etapa até ganhar ou perder.", icon: Plus, action: "Ver oportunidades", tab: "list" as const },
  { title: "Pipeline", detail: "Mova os negócios entre as etapas para enxergar o processo inteiro.", icon: Columns3, action: "Abrir pipeline", tab: "pipeline" as const },
  { title: "Contatos e mensagens", detail: "Abra um contato para ver seu histórico e use mensagens prontas no atendimento.", icon: MessageCircle, action: "Abrir contatos", href: "/contatos" },
  { title: "Métricas e CSV", detail: "Em Hoje, abra Operações para consultar resultados, importar ou exportar dados.", icon: BarChart3, action: "Ver métricas", tab: "today" as const },
];

export default function FeatureGuide({ onSelectTab, canManageTeam }: Props) {
  const entries = canManageTeam
    ? [...items, { title: "Equipe", detail: "Adicione até três funcionários e acompanhe quem atende cada oportunidade.", icon: Users, action: "Gerir equipe", tab: "team" as const }]
    : items;
  return (
    <details className="feature-guide">
      <summary><BookOpen size={16} /> <span>Como usar o Aether Flow</span><small>tutorial rápido</small></summary>
      <div className="feature-guide-grid">
        {entries.map((item) => {
          const { title, detail, icon: Icon, action, tab } = item;
          const href = "href" in item ? item.href : undefined;
          return <article key={title} className="feature-guide-item">
            <div className="feature-guide-icon"><Icon size={16} /></div>
            <div><strong>{title}</strong><p>{detail}</p></div>
            {href ? <a href={href}>{action}</a> : <button type="button" onClick={() => onSelectTab(tab!)}>{action}</button>}
          </article>
        })}
      </div>
    </details>
  );
}
