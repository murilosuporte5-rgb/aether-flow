"use client";

import { useEffect, useState } from "react";
import { ArrowRight, Check, CheckCircle2, ChevronLeft, CircleAlert, ExternalLink, ShieldCheck, Smartphone, Zap } from "lucide-react";

declare global { interface Window { FB?: { init?: (options: Record<string, unknown>) => void; login: (callback: (response: { authResponse?: { code?: string } }) => void, options: Record<string, unknown>) => void }; fbAsyncInit?: () => void; } }
type Config = { configured: boolean; appId: string; configId: string; qrConfigured?: boolean; pairingConfigured?: boolean };

export default function WhatsAppConnect() {
  const [config, setConfig] = useState<Config | null>(null);
  const [busy, setBusy] = useState(false);
  const [notice, setNotice] = useState("");
  const [qr, setQr] = useState("");
  const [qrBusy, setQrBusy] = useState(false);
  const [phone, setPhone] = useState("");
  const [pairingCode, setPairingCode] = useState("");
  const [instance, setInstance] = useState("");
  const [connectionState, setConnectionState] = useState<"idle" | "connecting" | "open" | "close">("idle");
  useEffect(() => { fetch("/api/whatsapp/config", { cache: "no-store" }).then((r) => r.json()).then(setConfig).catch(() => setConfig({ configured: false, appId: "", configId: "" })); }, []);
  function startSignup() {
    if (!config?.configured || !window.FB) { setNotice("A integração oficial aguarda a configuração da Meta pelo administrador."); return; }
    setBusy(true); setNotice("");
    window.FB.login(async (response) => {
      const code = response.authResponse?.code;
      if (!code) { setBusy(false); setNotice("A autorização foi cancelada. Nenhum dado foi alterado."); return; }
      const result = await fetch("/api/whatsapp/connect", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ code }) });
      const payload = await result.json().catch(() => ({}));
      setBusy(false); setNotice(payload.error || (result.ok ? "WhatsApp Business conectado." : "Não foi possível concluir a conexão."));
    }, { config_id: config.configId, response_type: "code", override_default_response_type: true, extras: { feature: "whatsapp_embedded_signup", version: "v23.0" } });
  }
  async function startQr() {
    setQrBusy(true); setNotice("");
    try {
      const response = await fetch("/api/whatsapp/qr", { method: "POST" });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Não foi possível iniciar o QR Code.");
      const image = payload.qrCode || payload.base64Qr || payload.qrcode;
      if (typeof image === "string") setQr(image.startsWith("data:") ? image : `data:image/png;base64,${image}`);
      else setNotice("O conector iniciou, mas ainda não entregou o QR Code. Aguarde alguns segundos e tente novamente.");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível iniciar o conector."); }
    finally { setQrBusy(false); }
  }
  async function startPairing() {
    setQrBusy(true); setNotice(""); setPairingCode(""); setInstance(""); setConnectionState("idle");
    try {
      const response = await fetch("/api/whatsapp/pair", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ phone }) });
      const payload = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(payload.error || "Não foi possível gerar o código.");
      setPairingCode(String(payload.pairingCode));
      setInstance(String(payload.instance || ""));
      setConnectionState("connecting");
    } catch (error) { setNotice(error instanceof Error ? error.message : "Não foi possível iniciar o pareamento."); }
    finally { setQrBusy(false); }
  }
  useEffect(() => {
    if (!instance || connectionState !== "connecting") return;
    let cancelled = false;
    let attempts = 0;
    const poll = async () => {
      attempts += 1;
      try {
        const response = await fetch(`/api/whatsapp/status?instance=${encodeURIComponent(instance)}`, { cache: "no-store" });
        const payload = await response.json().catch(() => ({}));
        if (cancelled) return;
        const state = payload.state === "open" ? "open" : payload.state === "close" ? "close" : "connecting";
        setConnectionState(state);
        if (state === "open") setNotice("WhatsApp conectado. Os novos leads poderão entrar no Aether.");
        else if (state === "close") setNotice("O WhatsApp recusou o pareamento. Gere um novo código e tente novamente.");
        else if (attempts < 20) window.setTimeout(poll, 3000);
        else setNotice("O código expirou sem abrir a sessão. Isso indica falha no conector, não no cadastro do lead.");
      } catch { if (!cancelled && attempts < 20) window.setTimeout(poll, 3000); }
    };
    void poll();
    return () => { cancelled = true; };
  }, [instance, connectionState]);
  useEffect(() => {
    if (!config?.configured || document.getElementById("facebook-jssdk")) return;
    const script = document.createElement("script"); script.id = "facebook-jssdk"; script.async = true; script.defer = true; script.crossOrigin = "anonymous"; script.src = "https://connect.facebook.net/en_US/sdk.js";
    window.fbAsyncInit = () => window.FB?.init?.({ appId: config.appId, cookie: true, xfbml: true, version: "v23.0" } as never);
    document.body.appendChild(script); return () => { script.remove(); };
  }, [config]);
  const officialReady = Boolean(config?.configured);
  const qrReady = Boolean(config?.qrConfigured);
  const pairingReady = Boolean(config?.pairingConfigured);
  return <>
    <header className="whatsapp-int-header"><a href="/" className="whatsapp-back"><ChevronLeft size={17}/> Voltar ao painel</a><span className="whatsapp-status"><span/> Ambiente seguro</span></header>
    <section className="whatsapp-int-hero"><div className="whatsapp-hero-copy"><span className="eyebrow">CONEXÃO PELO CELULAR</span><h1>Leads do WhatsApp dentro do Aether.</h1><p>Digite seu número e conecte pelo próprio celular usando um código de pareamento. Sem QR em outra tela e sem API da Meta.</p><div className="whatsapp-pair-card"><label>Número do WhatsApp<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="55 71 99999-9999" inputMode="tel"/></label><button className="primary whatsapp-connect-button" type="button" onClick={() => void startPairing()} disabled={qrBusy || !pairingReady}>{qrBusy ? "Gerando código…" : "Gerar código de pareamento"}<ArrowRight size={17}/></button>{pairingCode && <div className="whatsapp-pair-code" aria-live="polite"><span>{connectionState === "open" ? "Conectado" : connectionState === "close" ? "Pareamento recusado" : "Código de pareamento"}</span><strong>{pairingCode}</strong><small>No WhatsApp: Aparelhos conectados → Conectar aparelho → Conectar com número de telefone.</small></div>}</div><div className="whatsapp-hero-actions">{(qrReady || pairingReady) && <button className="secondary" type="button" onClick={() => void startQr()}>Usar QR Code</button>}{officialReady && <button className="secondary" type="button" onClick={startSignup}>Usar conexão oficial</button>}<a className="secondary" href="/capturar">Captura manual temporária</a></div>{!pairingReady && <p className="whatsapp-notice" role="status"><CircleAlert size={16}/> O conector móvel ainda precisa ser instalado no servidor. O fluxo por código já está preparado.</p>}{notice && <p className="whatsapp-notice" role="status"><CircleAlert size={16}/>{notice}</p>}</div><div className="whatsapp-hero-card"><div className="whatsapp-signal"><span className="whatsapp-signal-dot"/><span>Evolution API</span><b>{pairingReady ? "Pronto para conectar" : "Aguardando servidor"}</b></div><div className="whatsapp-phone"><Smartphone size={24}/><strong>Feito para o celular</strong><small>O código é digitado no próprio WhatsApp. Depois, os eventos entram no radar do Aether.</small></div></div></section>
    <section className="whatsapp-steps"><div className="whatsapp-section-label">COMO FUNCIONA</div><h2>Uma conexão séria em três passos.</h2><div className="whatsapp-step-grid"><article><span>01</span><ShieldCheck size={20}/><h3>Conecte com a Meta</h3><p>O login oficial autoriza apenas o WhatsApp Business escolhido pela sua empresa.</p></article><article><span>02</span><Smartphone size={20}/><h3>Confirme o número</h3><p>Escolha a conta e o número que devem receber as novas conversas.</p></article><article><span>03</span><Zap size={20}/><h3>Leads no radar</h3><p>As mensagens chegam por webhook seguro e viram oportunidades acompanháveis.</p></article></div></section>
    <section className="whatsapp-security"><div><span className="eyebrow">INFRAESTRUTURA</span><h2>Feito para operação, não para improviso.</h2><p>O Aether valida a assinatura enviada pela Meta, recebe os eventos no servidor e mantém o segredo fora do navegador.</p></div><div className="whatsapp-checks"><p><CheckCircle2 size={17}/> Webhook com assinatura HMAC</p><p><CheckCircle2 size={17}/> Credenciais somente no servidor</p><p><CheckCircle2 size={17}/> URL de retorno pronta para a Meta</p></div></section>
    <section className="whatsapp-admin-note"><div><strong>Transparência da conexão</strong><p>Sem uma conta de desenvolvedor da Meta, o WhatsApp não permite que um sistema leia conversas automaticamente. Por isso o fluxo principal usa o compartilhamento nativo do celular; quando as credenciais existirem, a conexão oficial poderá ser ativada sem mudar a experiência.</p></div><code>/capturar/share</code><a href="/capturar">Abrir captura <ExternalLink size={14}/></a></section>
  </>;
}
