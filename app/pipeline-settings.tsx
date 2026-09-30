"use client";
import { useEffect, useRef, useState } from "react";
import type { Stage } from "./workspace";
export default function PipelineSettings({
  stages,
  busy,
  error,
  onClose,
  onSave,
}: {
  stages: Stage[];
  busy: boolean;
  error: string;
  onClose: () => void;
  onSave: (stages: Stage[]) => Promise<boolean>;
}) {
  const [draft, setDraft] = useState(stages.map((s) => ({ ...s })));
  const form = useRef<HTMLFormElement>(null),
    busyRef = useRef(busy),
    closeRef = useRef(onClose);
  busyRef.current = busy;
  closeRef.current = onClose;
  useEffect(() => {
    const previous = document.activeElement as HTMLElement | null;
    form.current?.querySelector<HTMLInputElement>("input")?.focus();
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape" && !busyRef.current) closeRef.current();
      if (e.key === "Tab") {
        const all = [
          ...(form.current?.querySelectorAll<HTMLElement>(
            "input,select,button:not(:disabled)",
          ) || []),
        ].filter((x) => x.getClientRects().length);
        if (e.shiftKey && document.activeElement === all[0]) {
          e.preventDefault();
          all.at(-1)?.focus();
        } else if (!e.shiftKey && document.activeElement === all.at(-1)) {
          e.preventDefault();
          all[0]?.focus();
        }
      }
    };
    document.addEventListener("keydown", handler);
    return () => {
      document.removeEventListener("keydown", handler);
      previous?.focus();
    };
  }, []);
  const change = (i: number, patch: Partial<Stage>) =>
    setDraft(draft.map((s, n) => (n === i ? { ...s, ...patch } : s)));
  const move = (i: number, d: number) => {
    const next = [...draft];
    [next[i], next[i + d]] = [next[i + d], next[i]];
    setDraft(next);
  };
  return (
    <div className="modal-overlay">
      <form
        className="modal pipeline-settings"
        ref={form}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pipeline-heading"
        onSubmit={async (e) => {
          e.preventDefault();
          await onSave(draft);
        }}
      >
        <h2 id="pipeline-heading">Configurar pipeline</h2>
        <p>
          Mantenha uma etapa de ganho, uma de perda e pelo menos uma aberta.
          Etapas em uso precisam ficar no pipeline.
        </p>
        {draft.map((s, i) => (
          <div className="stage-config" key={s.id}>
            <label>
              Nome da etapa {i + 1}
              <input
                value={s.name}
                maxLength={100}
                required
                disabled={busy}
                onChange={(e) => change(i, { name: e.target.value })}
              />
            </label>
            <label>
              Tipo da etapa {i + 1}
              <select
                value={s.kind}
                disabled={busy}
                onChange={(e) => change(i, { kind: e.target.value })}
              >
                <option value="open">Aberta</option>
                <option value="won">Ganho</option>
                <option value="lost">Perda</option>
              </select>
            </label>
            <button
              type="button"
              disabled={busy || i === 0}
              aria-label={`Mover ${s.name} para cima`}
              onClick={() => move(i, -1)}
            >
              ↑
            </button>
            <button
              type="button"
              disabled={busy || i === draft.length - 1}
              aria-label={`Mover ${s.name} para baixo`}
              onClick={() => move(i, 1)}
            >
              ↓
            </button>
            <button
              type="button"
              disabled={busy}
              aria-label={`Excluir etapa ${s.name}`}
              onClick={() => setDraft(draft.filter((x) => x.id !== s.id))}
            >
              Excluir
            </button>
          </div>
        ))}
        <button
          type="button"
          disabled={busy || draft.length >= 30}
          onClick={() =>
            setDraft([
              ...draft,
              {
                id: crypto.randomUUID(),
                name: "Nova etapa",
                kind: "open",
                position: draft.length,
              },
            ])
          }
        >
          Adicionar etapa
        </button>
        {error && <p role="alert">{error}</p>}
        <div className="form-actions">
          <button type="button" onClick={onClose} disabled={busy}>
            Cancelar
          </button>
          <button className="primary" disabled={busy}>
            Salvar pipeline
          </button>
        </div>
      </form>
    </div>
  );
}
