"use client";
import { useEffect, useMemo, useState } from "react";
import WhatsAppAction from "./whatsapp-action";
import { messageTemplate } from "@/lib/execution";

type Saved = { id: string; name: string; body: string };
const defaults: Saved[] = [
  { id: "follow-up", name: "Acompanhamento", body: "Olá, {nome}. Estou entrando em contato para dar continuidade à nossa conversa sobre {oportunidade}." },
  { id: "proposal", name: "Proposta", body: "Olá, {nome}. Podemos conversar sobre a proposta de {oportunidade}?" },
];
const key = (companyId: string) => `aether-message-bank:${companyId}`;
const fill = (body: string, name: string, title: string) => body.replaceAll("{nome}", name.split(" ")[0]).replaceAll("{oportunidade}", title);

export default function MessageBank({ companyId, opportunityId, phone, name, title }: { companyId: string; opportunityId: string; phone: string | null; name: string; title: string }) {
  const [items, setItems] = useState<Saved[]>(defaults), [selected, setSelected] = useState("follow-up"), [draftName, setDraftName] = useState(""), [draftBody, setDraftBody] = useState(""), [open, setOpen] = useState(false);
  useEffect(() => { try { const raw = localStorage.getItem(key(companyId)); if (raw) setItems(JSON.parse(raw)); } catch {} }, [companyId]);
  const current = useMemo(() => items.find((x) => x.id === selected) || items[0], [items, selected]);
  const save = () => { const n = draftName.trim(), b = draftBody.trim(); if (!n || !b || b.length > 1000) return; const next = [...items, { id: crypto.randomUUID(), name: n.slice(0, 80), body: b }]; setItems(next); localStorage.setItem(key(companyId), JSON.stringify(next)); setSelected(next.at(-1)!.id); setDraftName(""); setDraftBody(""); setOpen(false); };
  return <div className="message-tools">
    <details open>
      <summary>Mensagem pronta</summary>
      <label className="message-picker">Escolha um modelo
        <select value={selected} onChange={(e) => setSelected(e.target.value)}>{items.map((x) => <option key={x.id} value={x.id}>{x.name}</option>)}</select>
      </label>
      <p className="message-preview">{fill(current?.body || messageTemplate(name, title), name, title)}</p>
      <WhatsAppAction companyId={companyId} opportunityId={opportunityId} phone={phone} name={name} message={fill(current?.body || "", name, title)} />
      <button type="button" className="text-button" onClick={() => setOpen((v) => !v)}>{open ? "Fechar biblioteca" : "Criar mensagem"}</button>
      {open && <div className="message-bank-form"><input aria-label="Nome da mensagem" placeholder="Nome da mensagem" value={draftName} onChange={(e) => setDraftName(e.target.value)} maxLength={80} /><textarea aria-label="Texto da mensagem" placeholder="Use {nome} e {oportunidade}" value={draftBody} onChange={(e) => setDraftBody(e.target.value)} maxLength={1000} rows={3} /><button type="button" className="primary" onClick={save} disabled={!draftName.trim() || !draftBody.trim()}>Salvar na biblioteca</button></div>}
    </details>
  </div>;
}
