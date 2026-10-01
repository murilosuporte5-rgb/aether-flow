"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/browser";

export default function RecoveryForm() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  async function submit(event: React.FormEvent) {
    event.preventDefault();
    setBusy(true); setError(""); setNotice("");
    try {
      const clean = email.trim().toLowerCase();
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(clean, { redirectTo: `${window.location.origin}/auth/confirm?type=recovery` });
      if (resetError) throw resetError;
      setNotice("Se o e-mail estiver cadastrado, o link de recuperação já foi enviado.");
    } catch {
      setError("Não foi possível enviar o link agora. Confira o e-mail e tente novamente.");
    } finally { setBusy(false); }
  }

  return <form className="login-form" onSubmit={submit}>
    <label>E-mail<input type="email" value={email} onChange={event => setEmail(event.target.value)} autoComplete="email" placeholder="seu@email.com" required /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    {notice && <p role="status" className="login-notice">{notice}</p>}
    <button className="primary login-action" disabled={busy}>{busy ? "Enviando link…" : "Enviar link de recuperação"}</button>
  </form>;
}
