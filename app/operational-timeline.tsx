"use client";
import type { Data, Event } from "./workspace";
import { TIME_ZONE, dateKey } from "@/lib/execution";

function eventTitle(h: Event) {
  if (h.event === "stage_changed" && h.payload.from_name && h.payload.to_name)
    return `${h.payload.from_name} → ${h.payload.to_name}`;
  if (
    h.event === "stage_changed" &&
    /[0-9a-f]{8}-[0-9a-f-]{27}/i.test(h.description)
  )
    return "Estágio alterado";
  return h.description;
}
export default function OperationalTimeline({
  events,
  owners,
}: {
  events: Event[];
  owners: Data["owners"];
}) {
  const today = dateKey(Date.now()),
    yesterday = dateKey(Date.now() - 86400000);
  let previous = "";
  return (
    <div className="timeline" aria-label="Histórico operacional">
      {!events.length && (
        <p className="empty-line">Ainda não há eventos registrados.</p>
      )}
      {events.map((h) => {
        const key = dateKey(h.created_at),
          heading = key !== previous;
        previous = key;
        const label =
          key === today
            ? "Hoje"
            : key === yesterday
              ? "Ontem"
              : new Intl.DateTimeFormat("pt-BR", {
                  dateStyle: "short",
                  timeZone: TIME_ZONE,
                }).format(new Date(h.created_at));
        const actor = owners.find((o) => o.id === h.actor_id)?.display_name;
        return (
          <div key={h.id}>
            {heading && <h4 className="timeline-day">{label}</h4>}
            <div className="history-item">
              <span className="timeline-dot" />
              <time dateTime={h.created_at}>
                {new Intl.DateTimeFormat("pt-BR", {
                  hour: "2-digit",
                  minute: "2-digit",
                  timeZone: TIME_ZONE,
                }).format(new Date(h.created_at))}
              </time>
              <strong>{eventTitle(h)}</strong>
              {h.payload.due_at && (
                <span>
                  {new Intl.DateTimeFormat("pt-BR", {
                    dateStyle: "short",
                    timeStyle: "short",
                    timeZone: TIME_ZONE,
                  }).format(new Date(h.payload.due_at))}
                </span>
              )}
              {h.payload.result && <p>{h.payload.result}</p>}
              {h.payload.note && <p>{h.payload.note}</p>}
              {actor && <small>{actor}</small>}
            </div>
          </div>
        );
      })}
    </div>
  );
}
