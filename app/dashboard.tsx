"use client";
import {
  ArrowRight,
  CalendarDays,
  Check,
  Clock3,
  MessageCircle,
  PhoneCall,
  UserRound,
} from "lucide-react";
import type { Row, Data } from "./workspace";
import WhatsAppAction from "./whatsapp-action";
import StaleIndicator from "./stale-indicator";
import WeeklySummary from "./weekly-summary";
import {
  comparePriority,
  daysSinceInteraction,
  staleLabel,
  STALE_THRESHOLDS,
} from "@/lib/execution";

type Props = {
  data: Data;
  rows: Row[];
  today: string;
  open: (r: Row) => void;
  complete: (r: Row) => void;
  reschedule: (r: Row) => void;
  viewList: (filter: string) => void;
  wa: (phone: string | null) => string | null;
  formatDate: (date: string | null) => string;
  money: (value: number | null) => string;
  onWhatsAppRecorded: () => void;
};
const dateKey = (s: string) => {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(s));
  const x = (k: string) => p.find((z) => z.type === k)?.value || "";
  return `${x("year")}-${x("month")}-${x("day")}`;
};
export default function Dashboard({
  data,
  rows,
  today,
  open,
  complete,
  reschedule,
  viewList,
  wa,
  formatDate,
  money,
  onWhatsAppRecorded,
}: Props) {
  const active = rows.filter((r) => r.status === "open"),
    overdue = active.filter(
      (r) => r.next_action_at && Date.parse(r.next_action_at) < Date.now(),
    ),
    due = active.filter(
      (r) =>
        r.next_action_at &&
        Date.parse(r.next_action_at) >= Date.now() &&
        dateKey(r.next_action_at) === today,
    ),
    missing = active.filter((r) => !r.next_action_at),
    future = active.filter(
      (r) => r.next_action_at && dateKey(r.next_action_at) > today,
    );
  const urgent = active
    .filter(
      (r) =>
        !r.next_action_at ||
        Date.parse(r.next_action_at) < Date.now() ||
        dateKey(r.next_action_at) === today ||
        (daysSinceInteraction(r.last_interaction_at) ?? -1) >=
          STALE_THRESHOLDS.stale,
    )
    .sort(comparePriority);
  const plannedWeek = future.filter(
    (r) => new Date(r.next_action_at!).getTime() < Date.now() + 7 * 86400000,
  );
  const stageCounts = data.stages.map((stage) => ({
    stage,
    count: rows.filter((r) => r.stage_id === stage.id).length,
  }));
  const owners = data.owners.map((o) => ({
    owner: o,
    pending: active.filter(
      (r) =>
        r.owner_id === o.id &&
        r.next_action_at &&
        dateKey(r.next_action_at) <= today,
    ).length,
    all: active.filter((r) => r.owner_id === o.id).length,
  }));
  return (
    <div className="dashboard-v2">
      <div className="focus-banner">
        <div>
          <span className="eyebrow">PANORAMA DA OPERAÇÃO</span>
          <h2>
            {urgent.length
              ? `${urgent.length} ${urgent.length === 1 ? "oportunidade precisa" : "oportunidades precisam"} de atenção`
              : "Tudo acompanhado por enquanto"}
          </h2>
          <p>
            {urgent.length
              ? "Comece pelos retornos vencidos, depois resolva os compromissos de hoje."
              : "As próximas ações estão agendadas. Acompanhe o que vem pela frente."}
          </p>
          <button
            onClick={() => (urgent.length ? open(urgent[0]) : viewList("all"))}
          >
            {urgent.length ? "Abrir primeira prioridade" : "Ver oportunidades"}{" "}
            <ArrowRight size={16} />
          </button>
        </div>
        <div
          className="focus-visual"
          aria-label={`${active.length} oportunidades abertas`}
        >
          <span>OPORTUNIDADES ABERTAS</span>
          <strong>{active.length}</strong>
          <small>{plannedWeek.length} com retorno nos próximos 7 dias</small>
        </div>
      </div>
      <section className="radar-strip" aria-label="Radar de atenção">
        <div className="radar-strip-head"><div><span className="eyebrow">RADAR DE ATENÇÃO</span><h3>Veja onde agir primeiro</h3></div><button onClick={() => viewList("all")}>Abrir oportunidades <ArrowRight size={15} /></button></div>
        <div className="radar-strip-grid">
          <button onClick={() => viewList("overdue")}><span>Retornos vencidos</span><strong>{overdue.length}</strong><small>Prioridade imediata</small></button>
          <button onClick={() => viewList("today")}><span>Ações para hoje</span><strong>{due.length}</strong><small>Compromissos do dia</small></button>
          <button onClick={() => viewList("none")}><span>Sem próximo passo</span><strong>{missing.length}</strong><small>Evite oportunidades paradas</small></button>
          <div className="radar-cash"><span>VALOR EM ABERTO</span><strong>{money(active.reduce((sum, row) => sum + (row.estimated_value || 0), 0))}</strong><small>{active.length} oportunidades acompanhadas</small></div>
        </div>
      </section>
      <WeeklySummary data={data} rows={rows} open={open} />
      <div className="dashboard-grid">
        <section className="priority-panel">
          <div className="panel-heading">
            <div>
              <span className="eyebrow">FILA DE TRABALHO</span>
              <h3>Prioridades para agir</h3>
            </div>
            <button onClick={() => viewList("all")}>
              Ver todas <ArrowRight size={15} />
            </button>
          </div>
          {urgent.length ? (
            <div className="priority-list">
              {urgent.slice(0, 7).map((r) => {
                const activity = data.activities.find(
                  (a) => a.opportunity_id === r.id && a.status === "pending",
                );
                const status = !r.next_action_at
                  ? "Definir ação"
                  : Date.parse(r.next_action_at) < Date.now()
                    ? "Vencido"
                    : dateKey(r.next_action_at) === today
                      ? "Hoje"
                      : "Parado";
                const reason = !r.next_action_at
                  ? "Sem próximo passo definido"
                  : Date.parse(r.next_action_at) < Date.now()
                    ? "Retorno vencido"
                    : dateKey(r.next_action_at) === today
                      ? "Ação prevista para hoje"
                      : "Sem interação recente";
                return (
                  <article className="priority-row" key={r.id}>
                    <div
                      className={`priority-stripe ${status === "Vencido" ? "late" : status === "Hoje" ? "due" : "missing"}`}
                    />
                    <div className="priority-info">
                      <div className="priority-name">
                        <button onClick={() => open(r)}>
                          {r.contact_name}
                        </button>
                        <span
                          className={`state ${status === "Vencido" ? "late" : status === "Hoje" ? "today" : ""}`}
                        >
                          {status}
                        </span>
                      </div>
                      <StaleIndicator date={r.last_interaction_at} />
                      <p>
                        {r.title} <span>·</span> {r.stage_name}
                      </p>
                      <span className="priority-reason">Por que está aqui: {reason}</span>
                      <div className="priority-sub">
                        <span>
                          {r.next_action_type || "Sem próxima ação"}{" "}
                          {r.next_action_at &&
                            `· ${formatDate(r.next_action_at)}`}
                        </span>
                        <span>
                          <UserRound size={12} /> {r.owner_name}
                        </span>
                      </div>
                    </div>
                    <div className="priority-actions">
                      <button
                        onClick={() => open(r)}
                        aria-label={`Abrir ${r.contact_name}`}
                      >
                        <ArrowRight size={17} />
                      </button>
                      {activity ? (
                        <button
                          onClick={() => complete(r)}
                          aria-label={`Concluir ação de ${r.contact_name}`}
                        >
                          <Check size={17} />
                        </button>
                      ) : (
                        <button
                          onClick={() => reschedule(r)}
                          aria-label={`Agendar ação de ${r.contact_name}`}
                        >
                          <CalendarDays size={17} />
                        </button>
                      )}
                      {r.next_action_at && (
                        <button
                          onClick={() => reschedule(r)}
                          aria-label={`Reagendar ação de ${r.contact_name}`}
                        >
                          <Clock3 size={17} />
                        </button>
                      )}
                      {wa(r.phone) && (
                        <WhatsAppAction
                          className="priority-whatsapp"
                          companyId={data.company!.id}
                          opportunityId={r.id}
                          phone={r.phone}
                          name={r.contact_name}
                          compact
                          onRecorded={onWhatsAppRecorded}
                        />
                      )}
                    </div>
                  </article>
                );
              })}
            </div>
          ) : (
            <div className="dashboard-empty">
              Sem retornos vencidos, ações para hoje ou oportunidades sem
              próximo passo.
            </div>
          )}
        </section>
        <aside className="insight-stack">
          <section className="insight-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">PROCESSO</span>
                <h3>Distribuição por etapa</h3>
              </div>
            </div>
            <div className="stage-rows">
              {stageCounts.map(({ stage, count }) => (
                <div className="stage-row" key={stage.id}>
                  <div>
                    <span>{stage.name}</span>
                    <strong>{count}</strong>
                  </div>
                  <div className="stage-track">
                    <span
                      style={{
                        width: `${rows.length ? Math.max((count / rows.length) * 100, count ? 4 : 0) : 0}%`,
                      }}
                    />
                  </div>
                </div>
              ))}
            </div>
            <p className="panel-footnote">
              {rows.length} oportunidades registradas neste ambiente.
            </p>
          </section>
          <section className="insight-panel">
            <div className="panel-heading">
              <div>
                <span className="eyebrow">EQUIPE</span>
                <h3>Por responsável</h3>
              </div>
            </div>
            {owners.length ? (
              owners.map(({ owner, pending, all }) => (
                <div className="owner-stat" key={owner.id}>
                  <span className="owner-avatar">
                    {owner.display_name.slice(0, 1).toUpperCase()}
                  </span>
                  <div>
                    <strong>{owner.display_name}</strong>
                    <small>{all} abertas</small>
                  </div>
                  <span>{pending} para resolver</span>
                </div>
              ))
            ) : (
              <p className="panel-footnote">Nenhum responsável vinculado.</p>
            )}
          </section>
        </aside>
      </div>
      <section className="upcoming-panel">
        <div className="panel-heading">
          <div>
            <span className="eyebrow">PLANEJAMENTO</span>
            <h3>Próximos retornos</h3>
          </div>
          <button onClick={() => viewList("week")}>
            Esta semana <ArrowRight size={15} />
          </button>
        </div>
        <div className="upcoming-grid">
          {future
            .sort((a, b) =>
              (a.next_action_at || "").localeCompare(b.next_action_at || ""),
            )
            .slice(0, 4)
            .map((r) => (
              <button
                className="upcoming-item"
                key={r.id}
                onClick={() => open(r)}
              >
                <span>{formatDate(r.next_action_at)}</span>
                <strong>{r.contact_name}</strong>
                <small>
                  {r.next_action_type} · {r.title}
                </small>
              </button>
            ))}
          {!future.length && (
            <p className="dashboard-empty">
              Nenhuma atividade futura agendada.
            </p>
          )}
        </div>
      </section>
    </div>
  );
}
