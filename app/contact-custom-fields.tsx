"use client";

import { useEffect, useState } from "react";
import type { ContactField } from "@/lib/contact-fields";

export default function ContactCustomFields({ companyId, contactId, fields, values, refresh }: {
  companyId: string; contactId: string; fields: ContactField[];
  values: Record<string, string | number>; refresh: () => void;
}) {
  const [drafts, setDrafts] = useState<Record<string, string>>({});
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState("");
  useEffect(() => {
    setDrafts(Object.fromEntries(Object.entries(values || {}).map(([key, value]) => [key, String(value)])));
    setMessage("");
  }, [contactId, values]);

  async function save(field: ContactField) {
    const raw = (drafts[field.field_key] || "").trim();
    const value = !raw ? null : field.field_type === "number" ? Number(raw) : raw;
    setBusy(field.field_key); setMessage("");
    try {
      const response = await fetch("/api/contacts/custom-field", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, contactId, fieldKey: field.field_key, value }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setMessage(`${field.label} salvo.`);
      refresh();
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível salvar."); }
    finally { setBusy(null); }
  }

  if (!fields.length) return null;
  return <section className="contact-custom-fields" aria-label="Campos personalizados">
    <h3>Dados personalizados</h3>
    {fields.map((field) => <div key={field.id} className="contact-custom-row">
      <label>{field.label}{!field.active && <small> · desativado</small>}
        <input type={field.field_type === "number" ? "number" : field.field_type === "date" ? "date" : "text"}
          step={field.field_type === "number" ? "any" : undefined}
          maxLength={field.field_type === "text" ? 200 : undefined}
          value={drafts[field.field_key] ?? ""}
          onChange={(event) => setDrafts((current) => ({ ...current, [field.field_key]: event.target.value }))}
          disabled={!field.active || busy !== null} />
      </label>
      {field.active && <button type="button" disabled={busy !== null || (drafts[field.field_key] ?? "") === String(values?.[field.field_key] ?? "")}
        onClick={() => void save(field)}>{busy === field.field_key ? "Salvando…" : "Salvar"}</button>}
    </div>)}
    {message && <p role="status">{message}</p>}
  </section>;
}
