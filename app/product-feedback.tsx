"use client";
import { useRef, useState } from "react";
export default function ProductFeedback({
  companyId,
  context,
}: {
  companyId: string;
  context: string;
}) {
  const [open, setOpen] = useState(false),
    [message, setMessage] = useState(""),
    [busy, setBusy] = useState(false),
    [notice, setNotice] = useState("");
  const request = useRef<string | null>(null);
  return (
    <section className="product-feedback" aria-label="Feedback do produto">
      <span>Algo te atrapalhou?</span>
      <button
        onClick={() => {
          setOpen(true);
          setNotice("");
        }}
      >
        Sim
      </button>
      <button
        onClick={() => {
          setOpen(false);
          setNotice("Obrigado por confirmar.");
        }}
      >
        Não
      </button>
      {open && (
        <form
          onSubmit={async (e) => {
            e.preventDefault();
            if (busy) return;
            setBusy(true);
            request.current ||= crypto.randomUUID();
            try {
              const r = await fetch("/api/workspace", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                  companyId,
                  kind: "feedback",
                  requestId: request.current,
                  context,
                  message,
                }),
              });
              const j = await r.json();
              if (!r.ok)
                throw new Error(
                  j.error || "Não foi possível enviar. Tente novamente.",
                );
              setNotice("Relato registrado. Obrigado.");
              setOpen(false);
              setMessage("");
              request.current = null;
            } catch (e) {
              setNotice(e instanceof Error ? e.message : "Falha ao enviar.");
            } finally {
              setBusy(false);
            }
          }}
        >
          <label>
            O que você tentou fazer?
            <textarea
              value={message}
              onChange={(e) => {
                setMessage(e.target.value);
                request.current = null;
              }}
              maxLength={1000}
              required
              disabled={busy}
            />
          </label>
          <button disabled={busy || !message.trim()}>Enviar relato</button>
        </form>
      )}
      {notice && <p role="status">{notice}</p>}
    </section>
  );
}
