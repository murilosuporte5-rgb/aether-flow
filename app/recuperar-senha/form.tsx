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
      // Keep the recovery intent explicit for both implicit and PKCE links.
      // Supabase may omit `type` when it returns a `code`, so the callback
      // needs a safe, explicit destination for the password form.
      const recoveryRedirect = new URL("/auth/confirm", window.location.origin);
      recoveryRedirect.searchParams.set("type", "recovery");
      recoveryRedirect.searchParams.set("next", "/activate?mode=recovery");
      const { error: resetError } = await createClient().auth.resetPasswordForEmail(clean, { redirectTo: recoveryRedirect.toString() });
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
