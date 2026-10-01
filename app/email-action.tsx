"use client";

import { Mail, Send, Save, LoaderCircle, Pencil } from "lucide-react";
import { useState } from "react";

export default function EmailAction({
  companyId,
  contactId,
  contactName,
  email,
  opportunityTitle,
}: {
  companyId: string;
  contactId: string;
  contactName: string;
  email: string | null;
  opportunityTitle?: string;
}) {
  const [address, setAddress] = useState(email || "");
  const [open, setOpen] = useState(false);
  const [editingAddress, setEditingAddress] = useState(!email);
  const [subject, setSubject] = useState(opportunityTitle ? `Acompanhamento: ${opportunityTitle}` : "Acompanhamento Aether Flow");
  const [text, setText] = useState(`Olá ${contactName},\n\nPassando para acompanhar nosso contato.\n\nAbraços,`);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  async function saveEmail(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/contacts/email", { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, contactId, email: address }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível salvar o e-mail.");
      setAddress(result.contact.email); setEditingAddress(false); setNotice("E-mail salvo. Você já pode escrever a mensagem."); setOpen(true);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível salvar o e-mail."); }
    finally { setBusy(false); }
  }

  async function sendEmail(event: React.FormEvent) {
    event.preventDefault(); setBusy(true); setError(""); setNotice("");
    try {
      const response = await fetch("/api/email/send", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, contactId, subject, text }) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Não foi possível enviar o e-mail.");
      setNotice("E-mail enviado."); setOpen(false);
    } catch (cause) { setError(cause instanceof Error ? cause.message : "Não foi possível enviar o e-mail."); }
    finally { setBusy(false); }
  }

  return <section className="contact-email-action">
    {!address || editingAddress ? <form onSubmit={saveEmail} className="contact-email-capture"><label>E-mail do contato<input type="email" required value={address} onChange={event => setAddress(event.target.value)} placeholder="cliente@empresa.com" /></label><div className="contact-email-buttons"><button className="secondary" disabled={busy}><Save size={15} /> {busy ? "Salvando…" : "Salvar e-mail"}</button>{address && <button type="button" className="text-button" disabled={busy} onClick={() => setEditingAddress(false)}>Cancelar</button>}</div></form> : <div className="contact-email-toolbar"><span><Mail size={15} /> {address}</span><button type="button" className="text-button" onClick={() => { setEditingAddress(true); setOpen(false); }}><Pencil size={14} /> Alterar</button><button className="secondary email-open-button" type="button" onClick={() => { setOpen(value => !value); setError(""); }}><Mail size={16} /> Enviar e-mail</button></div>}
    {open && address && <form className="email-compose" onSubmit={sendEmail}><label>Assunto<input required maxLength={160} value={subject} onChange={event => setSubject(event.target.value)} /></label><label>Mensagem<textarea required maxLength={10000} rows={6} value={text} onChange={event => setText(event.target.value)} /></label><button className="primary" disabled={busy}><Send size={15} /> {busy ? "Enviando…" : "Enviar pelo Resend"}</button></form>}
    {busy && <LoaderCircle className="loading-spinner" size={16} aria-label="Processando" />}
    {error && <p role="alert" className="form-error">{error}</p>}
    {notice && <p role="status" className="login-notice">{notice}</p>}
  </section>;
}
