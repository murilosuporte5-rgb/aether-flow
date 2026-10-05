"use client";

import { BarChart3, BookOpen, Check, ChevronLeft, ChevronRight, Columns3, MessageCircle, Plus, Radar, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";

type Props = { canManageTeam: boolean };
type Step = { title: string; detail: string; icon: typeof Radar };

const baseSteps: Step[] = [
  { title: "Radar", detail: "Comece em Hoje: a fila organiza retornos vencidos, ações do dia e oportunidades sem próximo passo.", icon: Radar },
  { title: "Oportunidades", detail: "Cadastre uma venda e acompanhe o caminho desde o primeiro contato até o resultado.", icon: Plus },
  { title: "Pipeline", detail: "Mova cada oportunidade entre as etapas para enxergar o processo inteiro.", icon: Columns3 },
  { title: "Contatos e mensagens", detail: "Abra o cliente para ver o histórico e use mensagens prontas no atendimento.", icon: MessageCircle },
  { title: "Métricas e CSV", detail: "Em Hoje, abra Operações para consultar resultados, importar uma planilha ou exportar seus dados.", icon: BarChart3 },
];

export default function FeatureGuide({ canManageTeam }: Props) {
  const steps = useMemo(() => canManageTeam ? [...baseSteps, { title: "Equipe", detail: "Adicione até três funcionários e acompanhe quem atende cada oportunidade.", icon: Users }] : baseSteps, [canManageTeam]);
  const [open, setOpen] = useState(false), [index, setIndex] = useState(0);
  const activeIndex = Math.min(index, steps.length - 1);
  const step = steps[activeIndex];
  useEffect(() => { if (window.localStorage.getItem("aether-flow:tutorial-seen") !== "1") setOpen(true); }, []);
  useEffect(() => { setIndex((value) => Math.min(value, steps.length - 1)); }, [steps.length]);
  function close() { setOpen(false); window.localStorage.setItem("aether-flow:tutorial-seen", "1"); }
  return (
    <section className={`feature-guide ${open ? "is-open" : ""}`} aria-label="Tutorial rápido do Aether Flow">
      <div className="feature-guide-head">
        <button type="button" className="feature-guide-trigger" aria-expanded={open} onClick={() => setOpen((value) => !value)}>
          <BookOpen size={16} /><span>Como usar o Aether Flow</span><small>{open ? "passo a passo" : "tutorial rápido"}</small>
        </button>
        {open && <button type="button" className="feature-guide-close" onClick={close} aria-label="Fechar tutorial"><X size={16} /></button>}
      </div>
      {open && <div className="feature-guide-body">
        <div className="feature-guide-progress" aria-label={`Passo ${activeIndex + 1} de ${steps.length}`}>
          {steps.map((item, itemIndex) => <span key={item.title} className={itemIndex === activeIndex ? "active" : itemIndex < activeIndex ? "done" : ""} />)}
        </div>
        <div className="feature-guide-step"><div className="feature-guide-icon"><step.icon size={19} /></div><div><span className="eyebrow">PASSO {activeIndex + 1} DE {steps.length}</span><strong>{step.title}</strong><p>{step.detail}</p></div></div>
        <div className="feature-guide-actions">
          <button type="button" className="feature-guide-secondary" onClick={() => setIndex((value) => Math.max(0, Math.min(value, steps.length - 1) - 1))} disabled={activeIndex === 0}><ChevronLeft size={15} /> Voltar</button>
          {activeIndex < steps.length - 1 ? <button type="button" className="primary" onClick={() => setIndex((value) => Math.min(steps.length - 1, Math.min(value, steps.length - 1) + 1))}>Próximo <ChevronRight size={15} /></button> : <button type="button" className="primary" onClick={close}><Check size={15} /> Concluir</button>}
        </div>
      </div>}
    </section>
  );
}
