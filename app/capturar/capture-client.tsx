"use client";

import { useEffect, useMemo, useState } from "react";

type Result = { id?: string; contact?: { id: string; name: string }; ok?: boolean; code?: string; error?: string };

type Workspace = {
  company?: { id: string; name: string };
  stages?: Array<{ id: string; name: string; kind: string }>;
};

const quickResults = ["Respondeu", "Não respondeu", "Pediu retorno", "Proposta enviada", "Vai decidir", "Fechou"];

export default function CaptureClient() {
  const params = useMemo(() => new URLSearchParams(typeof window === "undefined" ? "" : window.location.search), []);
  const name = (params.get("name") || "").trim().slice(0, 120);
  const phone = (params.get("phone") || "").trim().slice(0, 40);
  const [status, setStatus] = useState<"loading" | "done" | "error">("loading");
  const [message, setMessage] = useState("Validando sua sessão e preparando a captura…");
  const [result, setResult] = useState<Result | null>(null);
  const [selected, setSelected] = useState("");
  const [companyId, setCompanyId] = useState("");
  const [recording, setRecording] = useState(false);
  const [recorded, setRecorded] = useState(false);

  useEffect(() => {
    let cancelled = false;
    async function run() {
      if (params.get("capture") !== "1" || !name || !phone) {
        setStatus("error");
        setMessage("A captura precisa ser aberta a partir de uma conversa com nome e telefone disponíveis.");
        return;
      }
      try {
        const workspaceResponse = await fetch("/api/workspace", { cache: "no-store" });
        const workspace = (await workspaceResponse.json()) as Workspace & { error?: string };
        if (!workspaceResponse.ok || !workspace.company?.id) throw new Error(workspace.error || "Entre no Aether Flow antes de capturar.");
        setCompanyId(workspace.company.id);
        const stage = workspace.stages?.find((item) => item.kind === "open");
        if (!stage) throw new Error("A empresa ainda não tem um estágio aberto para receber a oportunidade.");
        const create = async (reuseContactId?: string) => {
          const response = await fetch("/api/workspace", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              companyId: workspace.company!.id,
              requestId: crypto.randomUUID(),
              kind: "create",
              contactName: name,
              phone,
              title: `Contato via WhatsApp · ${name}`,
              source: "WhatsApp",
              stageId: stage.id,
              details: "Capturado no WhatsApp Web pelo Aether Capture.",
              ...(reuseContactId ? { reuseContactId } : {}),
            }),
          });
          const payload = (await response.json()) as Result;
          if (response.status === 409 && payload.code === "DUPLICATE_CONTACT" && payload.contact?.id && !reuseContactId) return create(payload.contact.id);
          if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível criar a oportunidade.");
          return payload;
        };
        const payload = await create();
        if (cancelled) return;
        setResult(payload);
        setStatus("done");
        setMessage("Contato e oportunidade adicionados ao radar.");
      } catch (error) {
        if (cancelled) return;
        setStatus("error");
        setMessage(error instanceof Error ? error.message : "Não foi possível concluir a captura.");
      }
    }
    void run();
    return () => { cancelled = true; };
  }, [name, params, phone]);

  return (
    <main className="capture-page">
      <section className="capture-card" aria-live="polite">
        <span className="eyebrow">AETHER CAPTURE</span>
        <h1>{status === "loading" ? "Capturando no Aether Flow" : status === "done" ? "Captura concluída" : "Não foi possível capturar"}</h1>
        <p>{message}</p>
        {name && <div className="capture-contact"><strong>{name}</strong><span>{phone}</span><small>Origem: WhatsApp Web</small></div>}
        {status === "loading" && <div className="capture-loader" aria-label="Carregando" />}
        {status === "done" && <div className="capture-next"><span>Resultado do contato</span><div className="capture-actions">{quickResults.map((item) => <button key={item} type="button" disabled={recording || recorded} className={selected === item ? "selected" : ""} onClick={async () => {
          if (!result?.id || !companyId || recording || recorded) return;
          setSelected(item); setRecording(true);
          try {
            const response = await fetch("/api/workspace", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ companyId, requestId: crypto.randomUUID(), kind: "comment", id: result.id, comment: `Resultado do contato: ${item}` }) });
            const payload = (await response.json()) as Result;
            if (!response.ok || !payload.ok) throw new Error(payload.error || "Não foi possível registrar o resultado.");
            setRecorded(true);
          } catch (error) { setMessage(error instanceof Error ? error.message : "Não foi possível registrar o resultado."); setSelected(""); }
          finally { setRecording(false); }
        }}>{item}</button>)}</div>{recorded ? <small>Resultado registrado no histórico. Abra a oportunidade para definir a próxima ação.</small> : selected ? <small>{recording ? "Registrando…" : `Registrar “${selected}” no histórico.`}</small> : <small>Escolha uma opção para registrar o resultado sem redigitar a conversa.</small>}</div>}
        {result?.id && <a className="primary capture-link" href={`/?opportunity=${encodeURIComponent(result.id)}`}>Abrir no radar</a>}
        {status === "error" && <a className="secondary capture-link" href="/login">Entrar no Aether Flow</a>}
      </section>
    </main>
  );
}
