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
  return { capture: read("capture") === "1", name: read("name").trim().slice(0, 120), phone: read("phone").trim().slice(0, 40) };
}

export default function CaptureClient() {
  const initial = useMemo(() => typeof window === "undefined" ? { capture: false, name: "", phone: "" } : captureParams(), []);
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
  const captureStarted = useRef(false);

  useEffect(() => {
    if (!started) return;
    if (captureStarted.current) return;
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

  return <main className="capture-page"><section className="capture-card" aria-live="polite">
    <span className="eyebrow">AETHER CAPTURE</span>
    <h1>{status === "idle" ? "Capturar conversa" : status === "loading" ? "Capturando no Aether Flow" : status === "done" ? "Captura concluída" : "Não foi possível capturar"}</h1>
    <p>{message}</p>
    {status === "idle" && <form className="capture-manual-form" onSubmit={startManual}><label>Nome do contato<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ex.: Ana da Silva" autoComplete="name" /></label><label>Telefone<input value={phone} onChange={(event) => setPhone(event.target.value)} placeholder="Ex.: (71) 99999-9999" inputMode="tel" autoComplete="tel" /></label><button className="primary capture-link" type="submit">Adicionar ao Aether</button><small>No celular, use esta opção quando o WhatsApp não permitir extensão.</small></form>}
    {name && status !== "idle" && <div className="capture-contact"><strong>{name}</strong><span>{phone}</span><small>Origem: WhatsApp Web ou captura manual</small></div>}
    {status === "loading" && <div className="capture-loader" aria-label="Carregando" />}
    {status === "done" && <div className="capture-next"><span>Resultado do contato</span><div className="capture-actions">{quickResults.map((item) => <button key={item} type="button" disabled={recording || recorded} className={selected === item ? "selected" : ""} onClick={async () => { if (!result?.id || !companyId || recording || recorded) return; setSelected(item); setRecording(true); try { const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, requestId: crypto.randomUUID(), kind: "comment", id: result.id, comment: `Resultado do contato: ${item}` }) }); const payload = (await response.json()) as Result; if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível registrar o resultado."); setRecorded(true); } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível registrar o resultado."); setSelected(""); } finally { setRecording(false); } }}>{item}</button>)}</div><small>{recorded ? "Resultado registrado no histórico. Abra a oportunidade para definir a próxima ação." : selected ? (recording ? "Registrando…" : `Registrar “${selected}” no histórico.`) : "Escolha uma opção para registrar o resultado sem redigitar a conversa."}</small></div>}
    {result?.id && <a className="primary capture-link" href={`/?opportunity=${encodeURIComponent(result.id)}`}>Abrir no radar</a>}
    {status === "error" && <><a className="secondary capture-link" href="/login">Entrar no Aether Flow</a><button className="secondary capture-link" type="button" onClick={() => { captureStarted.current = false; setStarted(false); setStatus("idle"); setMessage("Corrija os dados e tente novamente."); }}>Tentar novamente</button></>}
  </section></main>;
}
