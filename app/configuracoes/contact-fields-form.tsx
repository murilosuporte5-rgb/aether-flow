"use client";

import { useState } from "react";
import type { ContactField, ContactFieldType } from "@/lib/contact-fields";

const typeNames: Record<ContactFieldType, string> = { text: "Texto", number: "Número", date: "Data" };

export default function ContactFieldsForm({ companyId, initialFields, canEdit }: {
  companyId: string; initialFields: ContactField[]; canEdit: boolean;
}) {
  const [fields, setFields] = useState(initialFields);
  const [label, setLabel] = useState("");
  const [fieldType, setFieldType] = useState<ContactFieldType>("text");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function add(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/contact-fields", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, label, fieldType }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível criar o campo.");
      setFields((current) => [...current, result.field]); setLabel(""); setMessage("Campo criado.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível criar o campo."); }
    finally { setBusy(false); }
  }

  async function toggle(field: ContactField) {
    setBusy(true); setMessage("");
    try {
      const response = await fetch("/api/contact-fields", {
        method: "PATCH", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, id: field.id, active: !field.active }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível alterar o campo.");
      setFields((current) => current.map((item) => item.id === field.id ? result.field : item));
      setMessage(result.field.active ? "Campo ativado." : "Campo desativado. Os valores existentes foram preservados.");
    } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível alterar o campo."); }
    finally { setBusy(false); }
  }

  return <article className="settings-card settings-branding-card">
    <div><h2>Campos dos contatos</h2><p>Adicione até 20 campos de texto, número ou data para esta empresa. Os dados ficam salvos em cada contato.</p></div>
    <div className="settings-field-list">{fields.length ? fields.map((field) => <div key={field.id}>
      <span><strong>{field.label}</strong><small>{typeNames[field.field_type]} · {field.active ? "Ativo" : "Desativado"}</small></span>
      {canEdit && <button type="button" disabled={busy} onClick={() => void toggle(field)}>{field.active ? "Desativar" : "Ativar"}</button>}
    </div>) : <p>Nenhum campo personalizado cadastrado.</p>}</div>
    {canEdit && <form className="settings-field-create" onSubmit={(event) => void add(event)}>
      <label>Nome do campo<input value={label} onChange={(event) => setLabel(event.target.value)} maxLength={50} placeholder="Ex.: Data do contrato" required /></label>
      <label>Tipo<select value={fieldType} onChange={(event) => setFieldType(event.target.value as ContactFieldType)}><option value="text">Texto</option><option value="number">Número</option><option value="date">Data</option></select></label>
      <button type="submit" className="primary" disabled={busy || !label.trim()}>{busy ? "Salvando…" : "Criar campo"}</button>
    </form>}
    {message && <p className="settings-branding-message" role="status">{message}</p>}
  </article>;
}
