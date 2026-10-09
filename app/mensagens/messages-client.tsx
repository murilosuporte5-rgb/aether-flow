"use client";

import { useEffect, useState } from "react";

type Item = { id: string; name: string; body: string };

export default function MessagesClient({ companyId, companyName }: { companyId: string; companyName: string }) {
  const [items, setItems] = useState<Item[]>([]);
  const [name, setName] = useState("");
  const [body, setBody] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    let active = true;
    fetch(`/api/message-templates?companyId=${encodeURIComponent(companyId)}`)
      .then(async (response) => {
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || "Não foi possível carregar os modelos.");
        if (active) setItems(result.items || []);
      })
      .catch((reason) => { if (active) setError(reason instanceof Error ? reason.message : "Não foi possível carregar os modelos."); });
    return () => { active = false; };
  }, [companyId]);

  async function add(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !body.trim()) return;
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/message-templates", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ companyId, name, body }),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar.");
      setItems((current) => [...current, result.item]); setName(""); setBody("");
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível salvar."); }
    finally { setBusy(false); }
  }

  async function remove(id: string) {
    setBusy(true); setError("");
    try {
      const response = await fetch(`/api/message-templates?companyId=${encodeURIComponent(companyId)}&id=${encodeURIComponent(id)}`, { method: "DELETE" });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível excluir.");
      setItems((current) => current.filter((item) => item.id !== id));
    } catch (reason) { setError(reason instanceof Error ? reason.message : "Não foi possível excluir."); }
    finally { setBusy(false); }
  }

  return <main className="page-body message-bank-page">
    <div className="heading"><div><div className="eyebrow">BIBLIOTECA · {companyName}</div><h1>Mensagens prontas</h1><p>Crie modelos e escolha um deles ao abrir o WhatsApp.</p></div></div>
    {error && <p role="alert">{error}</p>}
    <section className="message-bank-grid">
      <div className="message-bank-list">{items.length ? items.map((item) => <article key={item.id}>
        <strong>{item.name}</strong><p>{item.body}</p>
        <button type="button" className="text-button" disabled={busy} onClick={() => void remove(item.id)}>Excluir</button>
      </article>) : <p className="empty-line">Nenhum modelo salvo nesta empresa.</p>}</div>
      <form className="message-bank-form" onSubmit={(event) => void add(event)}><h2>Nova mensagem</h2>
        <input aria-label="Nome da mensagem" placeholder="Nome da mensagem" value={name} onChange={(event) => setName(event.target.value)} maxLength={80} />
        <textarea aria-label="Texto da mensagem" placeholder="Use {nome} e {oportunidade}" value={body} onChange={(event) => setBody(event.target.value)} maxLength={1000} rows={6} />
        <button className="primary" disabled={busy || !name.trim() || !body.trim()}>{busy ? "Salvando…" : "Salvar modelo"}</button>
      </form>
    </section>
  </main>;
}
