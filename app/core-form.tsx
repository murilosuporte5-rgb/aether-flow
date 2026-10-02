"use client";
import { useEffect, useRef, useState } from "react";
import { X } from "lucide-react";
import {
  ACTION_TYPES,
  LOSS_REASONS,
  TIME_ZONE,
  LEAD_SOURCES,
  formatPhone,
  normalizePhone,
  phoneForStorage,
} from "@/lib/execution";
import type { Data, Row, Stage } from "./workspace";

export type CoreMode =
  | "create"
  | "edit"
  | "schedule"
  | "reschedule"
  | "complete"
  | "close";
export type Duplicate = { id: string; name: string } | null;
function localInput(value: string | null) {
  return value
    ? new Intl.DateTimeFormat("sv-SE", {
        timeZone: TIME_ZONE,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .format(new Date(value))
        .replace(" ", "T")
    : "";
}
function isoInput(value: string) {
  return value ? new Date(`${value}:00-03:00`).toISOString() : "";
}

export default function CoreForm({
  mode,
  row,
  data,
  busy,
  error,
  duplicate,
  closingStage,
  initialActionType,
  onClose,
  onSave,
  onOpenOpportunity,
  onDuplicateReset,
  quick = false,
}: {
  mode: CoreMode;
  row: Row | null;
  data: Data;
  busy: boolean;
  error: string;
  duplicate: Duplicate;
  closingStage: Stage | null;
  initialActionType?: string | null;
  onClose: () => void;
  onSave: (payload: Record<string, unknown>) => Promise<boolean>;
  onOpenOpportunity: (id: string) => void;
  onDuplicateReset: () => void;
  quick?: boolean;
}) {
  const [name, setName] = useState(
    mode === "create" ? "" : row?.contact_name || "",
  );
  const [phone, setPhone] = useState(
    mode === "create" ? "" : row?.phone ? formatPhone(row.phone) : "",
  );
  const [title, setTitle] = useState(mode === "create" ? "" : row?.title || "");
  const [value, setValue] = useState(
    mode === "create" ? "" : row?.estimated_value?.toString() || "",
  );
  const [commercialAvailability, setCommercialAvailability] = useState<"" | "available" | "reserved" | "consult">(
    mode === "create" ? "" : row?.commercial_availability || "",
  );
  const [organization, setOrganization] = useState(
    mode === "create" ? "" : row?.organization || "",
  );
  const [source, setSource] = useState(
    mode === "create" ? "" : row?.source || "",
  );
  const [details, setDetails] = useState(
    mode === "create" ? "" : row?.details || "",
  );
  const [stageId, setStageId] = useState(
    data.stages.find((s) => s.kind === "open")?.id || "",
  );
  const [ownerId, setOwnerId] = useState("");
  const [type, setType] = useState(
    initialActionType ||
      (mode === "schedule" || mode === "reschedule"
        ? ACTION_TYPES.includes(
            row?.next_action_type as (typeof ACTION_TYPES)[number],
          )
          ? row!.next_action_type!
          : "Ligação"
        : ""),
  );
  const [due, setDue] = useState(
    mode === "reschedule" ? localInput(row?.next_action_at || null) : "",
  );
  const [note, setNote] = useState("");
  const [outcome, setOutcome] = useState(closingStage?.kind || "");
  const [lossReason, setLossReason] = useState("");
  const [lossNote, setLossNote] = useState("");
  const [result, setResult] = useState("");
  const [confirmed, setConfirmed] = useState(false);
  const [localError, setLocalError] = useState("");
  const [existingPreview, setExistingPreview] = useState(false);
  const form = useRef<HTMLFormElement>(null);
  const closeCallback = useRef(onClose);
  closeCallback.current = onClose;
  const busyRef = useRef(busy);
  busyRef.current = busy;
  const requestId = useRef(crypto.randomUUID());
  const close = mode === "close" || type === "close";
  const capture = mode === "create" || mode === "edit";
  const activityId = data.activities.find(
    (a) => a.opportunity_id === row?.id && a.status === "pending",
  )?.id;
  const heading =
    mode === "complete"
      ? "Qual é o próximo passo?"
      : mode === "close"
        ? "Encerrar oportunidade"
        : mode === "create"
          ? "Nova oportunidade"
          : mode === "edit"
            ? "Editar oportunidade"
            : "Agendar próxima ação";
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    form.current?.querySelector<HTMLElement>("input,select,button")?.focus();
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !busyRef.current) {
        event.preventDefault();
        closeCallback.current();
      }
      if (event.key !== "Tab") return;
      const focusable = [
        ...(form.current?.querySelectorAll<HTMLElement>(
          "button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled),a[href],summary",
        ) || []),
      ].filter((el) => el.getClientRects().length > 0);
      const first = focusable[0],
        last = focusable.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      }
      if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    document.addEventListener("keydown", key);
    return () => {
      document.removeEventListener("keydown", key);
      previous?.focus();
    };
  }, []);
  return (
    <div
      className={`modal-overlay${quick ? " quick-modal-overlay" : ""}`}
      onMouseDown={(e) => {
        if (!busy && e.target === e.currentTarget) onClose();
      }}
    >
      <form
        ref={form}
        className={`modal core-form${quick ? " quick-modal" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="core-form-heading"
        onSubmit={async (e) => {
          e.preventDefault();
          setLocalError("");
          if (capture && !normalizePhone(phone)) {
            setLocalError("Informe um telefone válido com DDD.");
            return;
          }
          if (confirmed && !result.trim()) {
            setLocalError("Registre o resultado do contato.");
            return;
          }
          const nextStep = close
            ? { outcome, lossReason, lossNote }
            : { type, dueAt: isoInput(due), note };
          const payload: Record<string, unknown> = capture
            ? {
                contactName: name,
                phone: phoneForStorage(phone),
                title,
                value,
                commercialAvailability,
                organization,
                source,
                details,
                stageId,
                ...(ownerId ? { ownerId } : {}),
                ...(mode === "create" && type
                  ? { actionType: type, dueAt: isoInput(due), note }
                  : {}),
              }
            : mode === "complete"
              ? { activityId, nextStep, result, contactConfirmed: confirmed }
              : mode === "close"
                ? { stageId: closingStage?.id, lossReason, lossNote }
                : { actionType: type, dueAt: isoInput(due), note };
          // The ID survives uncertain network outcomes; only known failures get a new ID.
          await onSave({ ...payload, requestId: requestId.current });
        }}
      >
        <div className="modal-head">
          <div>
            <span className="eyebrow">AETHER FLOW</span>
            <h2 id="core-form-heading">{quick ? "Entrada rápida" : heading}</h2>
          </div>
          <button
            type="button"
            aria-label="Fechar"
            disabled={busy}
            onClick={onClose}
          >
            <X size={20} />
          </button>
        </div>
        {mode === "complete" && (
          <div className="completion-context">
            <strong>
              {row?.contact_name} · {row?.next_action_type}
            </strong>
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={confirmed}
                onChange={(e) => setConfirmed(e.target.checked)}
              />{" "}
              Houve contato com o cliente
            </label>
            <label>
              Resultado {confirmed ? "*" : "(opcional)"}
              <input
                value={result}
                onChange={(e) => setResult(e.target.value)}
                maxLength={500}
                required={confirmed}
              />
            </label>
          </div>
        )}
        {capture ? (
          <>
            <div className="form-grid">
              <label>
                Nome do cliente *
                <input
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  maxLength={100}
                  autoComplete="name"
                />
              </label>
              <label>
                WhatsApp / telefone *
                <input
                  type="tel"
                  inputMode="tel"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value);
                    onDuplicateReset();
                  }}
                  onBlur={() => {
                    if (normalizePhone(phone)) setPhone(formatPhone(phone));
                  }}
                  required
                  maxLength={30}
                  placeholder="(71) 99999-9999"
                  autoComplete="tel"
                />
              </label>
              <label>
                Oportunidade *
                <input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  required
                  maxLength={160}
                />
              </label>
              <label>
                Valor (R$)
                <input
                  type="number"
                  min="0"
                  step="0.01"
                  value={value}
                  onChange={(e) => setValue(e.target.value)}
                />
              </label>
              {mode === "create" && (
                <>
                  <label>
                    Próxima ação
                    <select
                      value={type}
                      onChange={(e) => setType(e.target.value)}
                    >
                      <option value="">Definir depois</option>
                      {ACTION_TYPES.map((t) => (
                        <option key={t}>{t}</option>
                      ))}
                    </select>
                  </label>
                  {type && (
                    <label>
                      Data e horário *
                      <input
                        type="datetime-local"
                        value={due}
                        onChange={(e) => setDue(e.target.value)}
                        required
                      />
                    </label>
                  )}
                </>
              )}
            </div>
            {!quick && <details className="more-details">
              <summary>Mais detalhes</summary>
              <div className="form-grid">
                <label>
                  Empresa
                  <input
                    value={organization}
                    onChange={(e) => setOrganization(e.target.value)}
                    maxLength={100}
                  />
                </label>
                <label>
                  Disponibilidade comercial
                  <select value={commercialAvailability} onChange={(e) => setCommercialAvailability(e.target.value as "" | "available" | "reserved" | "consult")}>
                    <option value="">Sem indicação</option>
                    <option value="available">Disponível</option>
                    <option value="reserved">Reservado</option>
                    <option value="consult">Sob consulta</option>
                  </select>
                </label>
                <label>
                  Origem
                  <select
                    value={source}
                    onChange={(e) => setSource(e.target.value)}
                  >
                    <option value="">Não informada</option>
                    {source &&
                      !LEAD_SOURCES.includes(
                        source as (typeof LEAD_SOURCES)[number],
                      ) && (
                        <option value={source}>
                          {source} (registro anterior)
                        </option>
                      )}
                    {LEAD_SOURCES.map((s) => (
                      <option key={s}>{s}</option>
                    ))}
                  </select>
                </label>
                {mode === "create" && (
                  <>
                    <label>
                      Responsável
                      <select
                        value={ownerId}
                        onChange={(e) => setOwnerId(e.target.value)}
                      >
                        <option value="">Eu</option>
                        {data.owners.map((o) => (
                          <option key={o.id} value={o.id}>
                            {o.display_name}
                          </option>
                        ))}
                      </select>
                    </label>
                    <label>
                      Estágio inicial
                      <select
                        value={stageId}
                        onChange={(e) => setStageId(e.target.value)}
                        required
                      >
                        {data.stages
                          .filter((s) => s.kind === "open")
                          .map((s) => (
                            <option key={s.id} value={s.id}>
                              {s.name}
                            </option>
                          ))}
                      </select>
                    </label>
                  </>
                )}
                <label className="wide">
                  Descrição
                  <textarea
                    value={details}
                    onChange={(e) => setDetails(e.target.value)}
                    maxLength={500}
                    rows={2}
                  />
                </label>
                <label className="wide">
                  Observação da próxima ação
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    rows={2}
                  />
                </label>
              </div>
            </details>}
          </>
        ) : (
          <div className="form-grid">
            {mode !== "close" && (
              <label className="wide">
                Próximo passo *
                <select
                  value={type}
                  onChange={(e) => setType(e.target.value)}
                  required
                >
                  <option value="" disabled>
                    Selecione o próximo passo
                  </option>
                  {ACTION_TYPES.map((t) => (
                    <option key={t}>{t}</option>
                  ))}
                  {mode === "complete" && (
                    <option value="close">Sem próximo passo / encerrar</option>
                  )}
                </select>
              </label>
            )}
            {close ? (
              <>
                <label>
                  Resultado *
                  <select
                    value={outcome}
                    onChange={(e) => setOutcome(e.target.value)}
                    required
                    disabled={mode === "close"}
                  >
                    <option value="" disabled>
                      Selecione
                    </option>
                    <option value="won">Ganho</option>
                    <option value="lost">Perdido</option>
                  </select>
                </label>
                {outcome === "lost" && (
                  <>
                    <label>
                      Motivo da perda *
                      <select
                        value={lossReason}
                        onChange={(e) => setLossReason(e.target.value)}
                        required
                      >
                        <option value="" disabled>
                          Selecione
                        </option>
                        {LOSS_REASONS.map((r) => (
                          <option key={r}>{r}</option>
                        ))}
                      </select>
                    </label>
                    <label className="wide">
                      {lossReason === "Outro"
                        ? "Descreva o motivo *"
                        : "Observação (opcional)"}
                      <textarea
                        value={lossNote}
                        onChange={(e) => setLossNote(e.target.value)}
                        required={lossReason === "Outro"}
                        maxLength={500}
                        rows={2}
                      />
                    </label>
                  </>
                )}
              </>
            ) : (
              <>
                <label>
                  Data e horário *
                  <input
                    type="datetime-local"
                    value={due}
                    onChange={(e) => setDue(e.target.value)}
                    required
                  />
                </label>
                <label className="wide">
                  Observação (opcional)
                  <textarea
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    maxLength={500}
                    rows={2}
                  />
                </label>
              </>
            )}
          </div>
        )}
        {duplicate && mode === "create" && (
          <div className="duplicate-box" role="alert">
            <strong>Este telefone já pertence a {duplicate.name}.</strong>
            <div className="duplicate-actions">
              <button
                type="button"
                disabled={busy}
                onClick={() => setExistingPreview(!existingPreview)}
              >
                Abrir cliente existente
              </button>
              <button
                type="button"
                disabled={busy}
                onClick={async () => {
                  if (!form.current?.reportValidity()) return;
                  requestId.current = crypto.randomUUID();
                  await onSave({
                    requestId: requestId.current,
                    contactName: name,
                    phone: phoneForStorage(phone),
                    title,
                    value,
                    organization,
                    source,
                    details,
                    stageId,
                    reuseContactId: duplicate.id,
                    ...(ownerId ? { ownerId } : {}),
                    ...(type
                      ? { actionType: type, dueAt: isoInput(due), note }
                      : {}),
                  });
                }}
              >
                Criar nova oportunidade para este cliente
              </button>
              <button type="button" disabled={busy} onClick={onClose}>
                Cancelar
              </button>
            </div>
            {existingPreview && (
              <section>
                <h3>{duplicate.name}</h3>
                <p>{formatPhone(phone)}</p>
                {data.opportunities
                  .filter((o) => o.contact_id === duplicate.id)
                  .map((o) => (
                    <button
                      type="button"
                      key={o.id}
                      onClick={() => onOpenOpportunity(o.id)}
                    >
                      {o.title} · {o.stage_name}
                    </button>
                  ))}
              </section>
            )}
          </div>
        )}
        {(error || localError) && (
          <p className="form-error" role="alert">
            {localError || error}
          </p>
        )}
        <div className="modal-footer">
          <button
            type="button"
            className="secondary"
            onClick={onClose}
            disabled={busy}
          >
            Cancelar
          </button>
          <button
            className="primary"
            type="submit"
            disabled={busy || !!duplicate}
          >
            {busy
              ? "Salvando…"
              : mode === "complete"
                ? "Concluir e salvar próximo passo"
                : close
                  ? "Confirmar encerramento"
                  : "Salvar"}
          </button>
        </div>
      </form>
    </div>
  );
}
