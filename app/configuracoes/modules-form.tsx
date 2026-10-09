"use client";

import { useState } from "react";

export default function ModulesForm({ companyId, initialEnabled, canEdit }: {
  companyId: string;
  initialEnabled: boolean;
  canEdit: boolean;
}) {
  const [enabled, setEnabled] = useState(initialEnabled);
  const [saved, setSaved] = useState(initialEnabled);
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/company-modules", {
        method: "PUT", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, messagesEnabled: enabled }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setSaved(result.messagesEnabled);
      setMessage("Módulo salvo. A navegação será atualizada ao abrir o painel.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally { setBusy(false); }
  }

  return <article className="settings-card settings-branding-card">
    <div><h2>Módulos da empresa</h2><p>Ative apenas as ferramentas que a equipe vai usar. Os modelos salvos são preservados quando um módulo é desativado.</p></div>
    <label className="settings-module-option">
      <input type="checkbox" checked={enabled} onChange={(event) => { setEnabled(event.target.checked); setMessage(""); }} disabled={!canEdit || busy} />
      <span><strong>Mensagens prontas</strong><small>Biblioteca de modelos para atendimento.</small></span>
    </label>
    {canEdit ? <button type="button" className="primary" disabled={busy || enabled === saved} onClick={save}>{busy ? "Salvando…" : "Salvar módulos"}</button>
      : <p className="settings-branding-note">Somente proprietários e administradores podem alterar módulos.</p>}
    {message && <p className="settings-branding-message" role="status">{message}</p>}
  </article>;
}
