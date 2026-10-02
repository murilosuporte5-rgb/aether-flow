"use client";

import { Activity, ArrowRight, CircleDollarSign, Flag, Plus, TrendingDown, TrendingUp } from "lucide-react";
import type { Row, Data } from "./workspace";
import { comparePriority } from "@/lib/execution";

type Props = { data: Data; rows: Row[]; open: (row: Row) => void };
const weekMs = 7 * 86400000;

export default function WeeklySummary({ data, rows, open }: Props) {
  const now = Date.now(), start = now - weekMs, end = now + weekMs;
  const recent = (date: string) => Date.parse(date) >= start && Date.parse(date) <= now;
  const created = data.history.filter((event) => event.event === "created" && recent(event.created_at)).length;
  const actions = data.history.filter((event) => event.event === "activity_completed" && recent(event.created_at)).length;
  const won = data.history.filter((event) => event.event === "won" && recent(event.created_at)).length;
  const lost = data.history.filter((event) => event.event === "lost" && recent(event.created_at)).length;
  const proposalRows = rows.filter((row) => row.status === "open" && (/propost/i.test(row.stage_name) || row.next_action_type === "Aguardar cliente") && !!row.next_action_at);
  const proposals = proposalRows.length;
  const proposalValue = proposalRows.reduce((sum, row) => sum + (row.estimated_value || 0), 0);
  const priorities = rows.filter((row) => row.status === "open" && (!row.next_action_at || Date.parse(row.next_action_at) <= end)).sort(comparePriority).slice(0, 3);
  const cards = [
    [Plus, "Criadas", created, "novas oportunidades"],
    [Activity, "Ações", actions, "retornos concluídos"],
    [CircleDollarSign, "Aguardando", proposals, `${new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(proposalValue)} em propostas`],
    [TrendingUp, "Ganhos", won, "fechamentos"],
    [TrendingDown, "Perdas", lost, "resultados registrados"],
  ] as const;
  return <section className="weekly-summary" aria-label="Resumo dos últimos sete dias">
    <div className="weekly-summary-head"><div><span className="eyebrow">RESUMO SEMANAL</span><h3>O que aconteceu e o que vem agora</h3></div><span>Últimos 7 dias</span></div>
    <div className="weekly-summary-cards">{cards.map(([Icon, label, value, detail]) => <div className="weekly-summary-card" key={label}><Icon size={16} /><strong>{value}</strong><span>{label}</span><small>{detail}</small></div>)}</div>
    <div className="weekly-priorities"><div className="weekly-priorities-title"><Flag size={15} /><strong>Prioridades dos próximos 7 dias</strong><span>{priorities.length} destacadas</span></div>{priorities.length ? <div className="weekly-priority-list">{priorities.map((row) => <button type="button" key={row.id} onClick={() => open(row)}><span>{row.contact_name}</span><small>{row.next_action_type || "Definir próximo passo"} · {row.owner_name}</small><ArrowRight size={15} /></button>)}</div> : <p>Nenhuma prioridade nova foi encontrada. O radar está sob controle.</p>}</div>
  </section>;
}
