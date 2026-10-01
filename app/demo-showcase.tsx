"use client";

import { Check, MessageCircle, TrendingUp, X } from "lucide-react";
import { useEffect, useState } from "react";

const steps = [
  { label: "Nova oportunidade", detail: "Mariana · Proposta comercial", value: 4800, kind: "new" },
  { label: "Conversar agora", detail: "Mensagem pronta aberta no WhatsApp", value: 4800, kind: "chat" },
  { label: "Feito", detail: "Retorno registrado pela equipe", value: 4800, kind: "done" },
  { label: "Venda ganha", detail: "Proposta aprovada", value: 9600, kind: "won" },
  { label: "Venda perdida", detail: "Motivo registrado para aprender", value: 9600, kind: "lost" },
  { label: "Próxima prioridade", detail: "A operação já aponta o próximo retorno", value: 14400, kind: "next" },
] as const;

export default function DemoShowcase() {
  const [index, setIndex] = useState(0);
  useEffect(() => {
    const timer = window.setInterval(() => setIndex((current) => (current + 1) % steps.length), 2200);
    return () => window.clearInterval(timer);
  }, []);
  const step = steps[index];
  return (
    <section className="demo-showcase" aria-label="Demonstração guiada do Aether Flow">
      <div className="demo-showcase-head">
        <div><span className="eyebrow">DEMONSTRAÇÃO GUIADA</span><strong>Do primeiro contato ao caixa</strong></div>
        <span className="demo-showcase-count">{index + 1}/{steps.length}</span>
      </div>
      <div className="demo-frosted-app" aria-hidden="true">
        <div className="demo-app-shell"><div className="demo-app-top"><b>AETHER FLOW</b><span>Hoje · Radar</span><i>MS</i></div><div className="demo-app-body"><nav><span className="active">Radar</span><span>Contatos</span><span>Oportunidades</span><span>Mensagens</span></nav><main><div className="demo-app-kpis"><span><small>Em aberto</small><b>R$ 18.430</b></span><span><small>Ganhos</small><b>R$ 9.600</b></span><span><small>Taxa</small><b>42%</b></span></div><div className="demo-app-panel"><strong>Prioridades de hoje</strong><i><em>●</em> Mariana Souza <small>Proposta · R$ 4.800</small></i><i><em>●</em> Empresa Horizonte <small>Retorno vencido</small></i><i><em>●</em> Lucas Oliveira <small>Mensagem pronta</small></i></div></main></div></div>
      </div>
      <div className="demo-showcase-stage">
        <div className="demo-showcase-copy" aria-live="polite">
          <span className="demo-step-kicker">AGORA NO RADAR</span>
          <h3>{step.label}</h3>
          <p>{step.detail}</p>
          <div className="demo-step-actions">
            <span className={`demo-event-icon ${step.kind === "won" ? "won" : step.kind === "lost" ? "lost" : ""}`}>
              {step.kind === "chat" ? <MessageCircle size={16} /> : step.kind === "lost" ? <X size={16} /> : step.kind === "won" || step.kind === "done" ? <Check size={16} /> : <TrendingUp size={16} />}
            </span>
            <span>{step.kind === "lost" ? "Aprendizado salvo" : step.kind === "won" ? "Resultado no período" : "Ação registrada"}</span>
          </div>
        </div>
        <div className="demo-cash-card"><small>VALOR EM MOVIMENTO</small><strong>R$ {step.value.toLocaleString("pt-BR")}</strong><div className="demo-cash-track"><span style={{ width: `${Math.max(22, ((index + 1) / steps.length) * 100)}%` }} /></div><span>Operação acompanhada em um só lugar</span></div>
      </div>
      <div className="demo-timeline" aria-hidden="true">{steps.map((item, itemIndex) => <span key={item.label} className={itemIndex <= index ? "active" : ""} />)}</div>
    </section>
  );
}
