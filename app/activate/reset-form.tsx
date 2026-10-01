"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/browser";

export default function ResetPasswordForm() {
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  async function reset(event: React.FormEvent) {
    event.preventDefault();
    if (password !== confirm) { setError("As senhas não conferem."); return; }
    setBusy(true); setError("");
    try {
      const { error: updateError } = await createClient().auth.updateUser({ password });
      if (updateError) throw updateError;
      router.replace("/login?reset=success"); router.refresh();
    } catch { setError("Não foi possível atualizar a senha. Abra o link novamente e tente."); }
    finally { setBusy(false); }
  }
  return <form className="login-form" onSubmit={reset}>
    <label>Nova senha<input type="password" minLength={12} required autoComplete="new-password" value={password} onChange={event => setPassword(event.target.value)} /></label>
    <label>Confirmar senha<input type="password" minLength={12} required autoComplete="new-password" value={confirm} onChange={event => setConfirm(event.target.value)} /></label>
    {error && <p role="alert" className="form-error">{error}</p>}
    <button className="primary login-action" disabled={busy}>{busy ? "Salvando…" : "Salvar nova senha"}</button>
  </form>;
}
