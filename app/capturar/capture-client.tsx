"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type Result = { id?: string; contact?: { id: string; name: string }; ok?: boolean; code?: string; error?: string };
type Workspace = { company?: { id: string }; stages?: Array<{ id: string; kind: string }> };
type Status = "idle" | "loading" | "done" | "error";
const quickResults = ["Respondeu", "Não respondeu", "Pediu retorno", "Proposta enviada", "Vai decidir", "Fechou"];

function captureParams() {
  const search = new URLSearchParams(window.location.search);
  const hash = new URLSearchParams(window.location.hash.replace(/^#/, ""));
  const read = (key: string) => hash.get(key) || search.get(key) || "";
  return { capture: read("capture") === "1", name: read("name").trim().slice(0, 120), phone: read("phone").trim().slice(0, 40), source: read("source").trim().slice(0, 60) || "WhatsApp" };
}

export default function CaptureClient() {
  const initial = useMemo(() => typeof window === "undefined" ? { capture: false, name: "", phone: "", source: "WhatsApp" } : captureParams(), []);
  const [name, setName] = useState(initial.name);
  const [phone, setPhone] = useState(initial.phone);
  const [started, setStarted] = useState(initial.capture && Boolean(initial.name && initial.phone));
  const [status, setStatus] = useState<Status>(initial.capture ? "loading" : "idle");
  const [message, setMessage] = useState(initial.capture ? "Validando sua sessão e preparando a captura…" : "Use esta tela no celular para cadastrar uma conversa rapidamente.");
  const [result, setResult] = useState<Result | null>(null);
  const [companyId, setCompanyId] = useState("");
  const [selected, setSelected] = useState("");
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);
  const [nextDue, setNextDue] = useState("");
  const [scheduling, setScheduling] = useState(false);
  const [scheduled, setScheduled] = useState(false);
  const [pasted, setPasted] = useState("");
  const [clipboardBusy, setClipboardBusy] = useState(false);
  const [showShareHelp, setShowShareHelp] = useState(false);
  const captureStarted = useRef(false);

  function suggestedDue(offset: number) {
    const value = new Date();
    if (offset === 0) value.setHours(value.getHours() + 1, 0, 0, 0);
    else {
      value.setDate(value.getDate() + (offset === 2 ? 1 : offset));
      if (offset === 2) while (value.getDay() === 0 || value.getDay() === 6) value.setDate(value.getDate() + 1);
      value.setHours(10, 0, 0, 0);
    }
    const local = new Date(value.getTime() - value.getTimezoneOffset() * 60000);
    return local.toISOString().slice(0, 16);
  }

  async function scheduleNextAction() {
    if (!result?.id || !companyId || !nextDue || scheduling || scheduled) return;
    setScheduling(true);
    try {
      const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, requestId: crypto.randomUUID(), kind: "schedule", id: result.id, actionType: "Follow-up", dueAt: new Date(nextDue).toISOString(), note: `Próximo passo após: ${selected}` }) });
      const payload = (await response.json()) as Result;
      if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível agendar a próxima ação.");
      setScheduled(true);
    } catch (error) {
      setMessage(error instanceof Error ? error.message : "Não foi possível agendar a próxima ação.");
    } finally { setScheduling(false); }
  }

  useEffect(() => {
    if (!started) return;
    if (captureStarted.current) return;
    if (window.location.hash) window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}`);
    captureStarted.current = true;
    let cancelled = false;
    async function run() {
      setStatus("loading");
      try {
        const workspaceResponse = await fetch("/api/workspace", { cache: "no-store" });
        const workspace = (await workspaceResponse.json()) as Workspace & { error?: string };
        if (!workspaceResponse.ok || !workspace.company?.id) throw new Error(workspace.error || "Entre no Aether Flow antes de capturar.");
        setCompanyId(workspace.company.id);
        const stage = workspace.stages?.find((item) => item.kind === "open");
        if (!stage) throw new Error("A empresa ainda não tem um estágio aberto para receber a oportunidade.");
        const create = async (reuseContactId?: string): Promise<Result> => {
          const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId: workspace.company!.id, requestId: crypto.randomUUID(), kind: "create", contactName: name, phone, title: `Contato via WhatsApp · ${name}`, source: "WhatsApp", stageId: stage.id, details: "Capturado pelo Aether Capture.", ...(reuseContactId ? { reuseContactId } : {}) }) });
          const payload = (await response.json()) as Result;
          if (response.status === 409 && payload.code === "DUPLICATE_CONTACT" && payload.contact?.id && !reuseContactId) return create(payload.contact.id);
          if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível criar a oportunidade.");
          return payload;
        };
        const payload = await create();
        if (cancelled) return;
        setResult(payload); setStatus("done"); setMessage("Contato e oportunidade adicionados ao radar.");
      } catch (error) {
        if (cancelled) return;
        setStatus("error"); setMessage(error instanceof Error ? error.message : "Não foi possível concluir a captura.");
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [started, name, phone]);

  function startManual(event: React.FormEvent) {
    event.preventDefault();
    if (!name.trim() || !phone.trim()) { setStatus("error"); setMessage("Informe nome e telefone para capturar a conversa."); return; }
    setStarted(true); setSelected(""); setRecorded(false);
  }

  function processPasted(value: string) {
    value = value.trim();
    const phoneMatch = value.match(/(?:\+?\d[\d\s().-]{7,}\d)/);
    const phoneValue = phoneMatch?.[0]?.trim() || "";
    const lines = value.split(/\r?\n/).map((line) => line.trim()).filter(Boolean);
    const nameValue = lines.find((line) => !phoneMatch?.[0]?.includes(line) && !/^(whatsapp|conversa|mensagem|ontem|hoje|online|visto por último)/i.test(line)) || "";
    if (!phoneValue) { setStatus("error"); setMessage("Não encontrei um telefone no conteúdo colado. Copie os dados do contato no WhatsApp e tente novamente."); return; }
    setName(nameValue.slice(0, 120) || "Contato do WhatsApp");
    setPhone(phoneValue);
    setStarted(true);
    setStatus("loading");
    setMessage("Dados encontrados. Salvando o contato no Aether Flow…");
  }

  function readPasted(event: React.FormEvent) {
    event.preventDefault();
    processPasted(pasted);
  }

  async function readClipboard() {
    if (!navigator.clipboard?.readText) { setStatus("error"); setMessage("Seu navegador não permite leitura automática. Cole o conteúdo no campo abaixo."); return; }
    setClipboardBusy(true);
    try {
      const value = await navigator.clipboard.readText();
      if (!value.trim()) throw new Error("A área de transferência está vazia.");
      setPasted(value);
      processPasted(value);
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Não foi possível ler a área de transferência.");
    } finally { setClipboardBusy(false); }
  }

  return <main className="capture-page"><section className="capture-card" aria-live="polite">
    <span className="eyebrow">AETHER CAPTURE</span>
    <h1>{status === "idle" ? "Capturar conversa" : status === "loading" ? "Capturando no Aether Flow" : status === "done" ? "Captura concluída" : "Não foi possível capturar"}</h1>
    <p>{message}</p>
    {status === "idle" && <><div className="capture-paste-guide"><strong>Capturar do WhatsApp em um toque</strong><p>Copie o contato ou um trecho da conversa no WhatsApp. O botão abaixo lê sua área de transferência e encontra o telefone automaticamente.</p><div className="capture-paste-actions"><button className="primary" type="button" onClick={() => void readClipboard()} disabled={clipboardBusy}>{clipboardBusy ? "Lendo…" : "Ler área de transferência"}</button><button className="secondary" type="button" onClick={() => setShowShareHelp(true)}>Como compartilhar</button></div><form onSubmit={readPasted}><textarea value={pasted} onChange={(event) => setPasted(event.target.value)} placeholder="Ou cole aqui o nome, telefone ou trecho da conversa…" rows={4} /><button className="secondary capture-link" type="submit">Ler conteúdo colado</button></form><small>O conteúdo fica no seu navegador até você enviar. Nada é lido automaticamente do WhatsApp.</small></div><div className="capture-mobile-guide"><strong>No celular · compartilhar com o Aether</strong><ol><li>No WhatsApp, abra a conversa e toque em <b>Compartilhar</b>.</li><li>Escolha <b>Aether Capture</b> ou “Adicionar à tela inicial” no Chrome.</li><li>Revise os dados e confirme.</li></ol><p>Se o Aether não aparecer na lista, copie o contato e use “Ler área de transferência”.</p></div><form className="capture-manual-form" onSubmit={startManual}><span className="capture-form-divider">Ou adicione manualmente</span><label>Nome do contato<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Ana da Silva" autoComplete="name" /></label><label>Telefone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ex.: (71) 99999-9999" inputMode="tel" autoComplete="tel" /></label><button className="primary capture-link" type="submit">Adicionar ao Aether</button><small>O fluxo de colagem e compartilhamento funciona sem credenciais externas.</small></form>{showShareHelp && <div className="capture-share-help" role="dialog" aria-modal="true" aria-label="Como compartilhar uma conversa"><button type="button" className="capture-share-close" onClick={() => setShowShareHelp(false)} aria-label="Fechar">×</button><span className="eyebrow">COMPARTILHAMENTO NATIVO</span><h2>Do WhatsApp para o Aether</h2><ol><li><b>Abra a conversa</b><small>Entre no WhatsApp e selecione o contato.</small></li><li><b>Toque em compartilhar</b><small>Envie o texto para o Aether Capture.</small></li><li><b>Confirme o lead</b><small>Revise o telefone antes de salvar.</small></li></ol><button className="primary capture-link" type="button" onClick={() => setShowShareHelp(false)}>Entendi</button></div>}</>}
    {name && status !== "idle" && <div className="capture-contact"><strong>{name}</strong><span>{phone}</span><small>Origem: {initial.source || "WhatsApp"} · revise os dados antes de seguir</small></div>}
    {status === "loading" && <div className="capture-loader" aria-label="Carregando" />}
    {status === "done" && <div className="capture-next"><span>Resultado do contato</span><div className="capture-actions">{quickResults.map((item) => <button key={item} type="button" disabled={recording || recorded} className={selected === item ? "selected" : ""} onClick={async () => { if (!result?.id || !companyId || recording || recorded) return; setSelected(item); setRecording(true); try { const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, requestId: crypto.randomUUID(), kind: "comment", id: result.id, comment: `Resultado do contato: ${item}` }) }); const payload = (await response.json()) as Result; if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível registrar o resultado."); setRecorded(true); setNextDue(suggestedDue(1)); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível registrar o resultado."); setSelected(""); } finally { setRecording(false); } }}>{item}</button>)}</div><small>{recorded ? "Resultado registrado. Agora escolha quando o próximo passo deve acontecer." : selected ? (recording ? "Registrando…" : `Registrar “${selected}” no histórico.`) : "Escolha uma opção para registrar o resultado sem redigitar a conversa."}</small>{recorded && <div className="capture-follow-up" aria-live="polite"><strong>Próxima ação</strong><div className="capture-actions"><button type="button" onClick={() => setNextDue(suggestedDue(0))}>Hoje</button><button type="button" onClick={() => setNextDue(suggestedDue(1))}>Amanhã</button><button type="button" onClick={() => setNextDue(suggestedDue(2))}>Próximo dia útil</button></div><label>Escolher data e hora<input type="datetime-local" value={nextDue} min={suggestedDue(0)} onChange={(event) => setNextDue(event.target.value)} /></label><button className="primary capture-link" type="button" disabled={!nextDue || scheduling || scheduled} onClick={() => void scheduleNextAction()}>{scheduled ? "Próxima ação confirmada" : scheduling ? "Agendando…" : "Confirmar próximo passo"}</button><small>{scheduled ? "Lead acompanhado: o follow-up já está no radar." : "Você pode ajustar depois na oportunidade."}</small></div>}</div>}
    {result?.id && <a className="primary capture-link" href={`/?opportunity=${encodeURIComponent(result.id)}`}>Abrir no radar</a>}
    {status === "error" && <><a className="secondary capture-link" href="/login">Entrar no Aether Flow</a><button className="secondary capture-link" type="button" onClick={() => { captureStarted.current = false; setStarted(false); setStatus("idle"); setMessage("Corrija os dados e tente novamente."); }}>Tentar novamente</button></>}
  </section></main>;
}
