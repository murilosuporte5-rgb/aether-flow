"use client";
import { useRef, useState } from "react";
import { MessageCircle } from "lucide-react";
import { whatsappUrl } from "@/lib/execution";

type Props = {
  companyId: string;
  opportunityId: string;
  phone: string | null;
  name: string;
  message?: string;
  className?: string;
  compact?: boolean;
  onRecorded?: () => void;
};
export default function WhatsAppAction({
  companyId,
  opportunityId,
  phone,
  name,
  message = "",
  className = "whatsapp-button",
  compact,
  onRecorded,
}: Props) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const pending = useRef<string | null>(null);
  const locked = useRef(false);
  const url = whatsappUrl(phone, message);
  if (!url) return <span className="no-whatsapp">Sem número válido</span>;
  return (
    <span className="whatsapp-action">
      <button
        type="button"
        className={className}
        disabled={busy}
        title="Falar no WhatsApp"
        aria-label={`Falar com ${name} no WhatsApp`}
        onClick={async (event) => {
          event.stopPropagation();
          if (locked.current) return;
          locked.current = true;
          setBusy(true);
          setError("");
          // Open the conversation immediately from the user gesture. Logging must
          // never prevent the customer from reaching WhatsApp.
          const target = window.open(url, "_blank");
          if (!target) {
            setError("Permita abrir uma nova aba e tente novamente.");
            locked.current = false;
            setBusy(false);
            return;
          }
          target.opener = null;
          pending.current ??= crypto.randomUUID();
          try {
            const response = await fetch("/api/workspace", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                companyId,
                id: opportunityId,
                kind: "whatsapp_opened",
                requestId: pending.current,
              }),
            });
            const result = await response.json();
            if (!response.ok || !result.ok) {
              if (response.status < 500) pending.current = null;
              throw new Error(
                result.error || "Não foi possível registrar a abertura.",
              );
            }
            pending.current = null;
            onRecorded?.();
          } catch (cause) {
            setError(
              cause instanceof Error
                ? `WhatsApp aberto. ${cause.message}`
                : "WhatsApp aberto, mas não foi possível registrar a atividade.",
            );
          } finally {
            locked.current = false;
            setBusy(false);
          }
        }}
      >
        <MessageCircle size={16} />
        {compact ? null : busy ? "Abrindo…" : "Falar no WhatsApp"}
      </button>
      {error && (
        <small role="alert" className="form-error">
          {error}
        </small>
      )}
    </span>
  );
}
