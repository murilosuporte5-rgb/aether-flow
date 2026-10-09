"use client";

import { useState } from "react";
import { brandColors, brandColorOrDefault } from "@/lib/company-branding";

export default function BrandingForm({ companyId, companyName, initialColor, canEdit }: {
  companyId: string;
  companyName: string;
  initialColor: string;
  canEdit: boolean;
}) {
  const [color, setColor] = useState(brandColorOrDefault(initialColor));
  const [savedColor, setSavedColor] = useState(brandColorOrDefault(initialColor));
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");

  async function save() {
    setBusy(true);
    setMessage("");
    try {
      const response = await fetch("/api/company-branding", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, accentColor: color }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setSavedColor(result.accentColor);
      setMessage("Identidade visual salva. O painel usará esta cor ao recarregar.");
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível salvar.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <article className="settings-card settings-branding-card">
      <div className="settings-branding-head">
        <span className="settings-card-icon" style={{ color, backgroundColor: `${color}18` }}>●</span>
        <div><h2>Identidade visual de {companyName}</h2><p>Escolha a cor de destaque do painel para esta empresa.</p></div>
      </div>
      <div className="settings-brand-colors" role="group" aria-label="Cor de destaque">
        {brandColors.map((option) => (
          <button key={option.value} type="button" className={color === option.value ? "selected" : ""}
            onClick={() => { setColor(option.value); setMessage(""); }}
            disabled={!canEdit || busy} aria-pressed={color === option.value} aria-label={option.label}>
            <span style={{ backgroundColor: option.value }} />{option.label}
          </button>
        ))}
      </div>
      {canEdit ? (
        <button type="button" className="primary" onClick={save} disabled={busy || color === savedColor}>
          {busy ? "Salvando…" : "Salvar cor"}
        </button>
      ) : <p className="settings-branding-note">Somente proprietários e administradores podem alterar esta preferência.</p>}
      {message && <p className="settings-branding-message" role="status">{message}</p>}
    </article>
  );
}
