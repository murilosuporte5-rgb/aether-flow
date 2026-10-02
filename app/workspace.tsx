"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  ArrowUpRight,
  BarChart3,
  Bell,
  Boxes,
  CalendarDays,
  Check,
  ChevronDown,
  Clock3,
  Columns3,
  LayoutList,
  MessageCircle,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Share2,
  SlidersHorizontal,
  X,
  Users,
} from "lucide-react";
import { templates, type TemplateKey } from "../lib/templates";
import Dashboard from "./dashboard";
import CoreForm, { type CoreMode, type Duplicate } from "./core-form";
import WhatsAppAction from "./whatsapp-action";
import StaleIndicator from "./stale-indicator";
import OperationalTimeline from "./operational-timeline";
import ProductFeedback from "./product-feedback";
import PipelineSettings from "./pipeline-settings";
import Contacts from "./contacts";
import BusinessOperations from "./business-operations";
import MessageBank from "./message-bank";
import Team from "./team";
import FeatureGuide from "./feature-guide";
import { AetherMark } from "./aether-logo";
import { elapsedDays, matchesSearch, pendingQueue } from "@/lib/daily-work";
import {
  comparePriority,
  priorityRank,
  formatPhone,
  messageTemplate,
  staleLabel,
  whatsappUrl,
  STAGE_STALE_DAYS,
} from "@/lib/execution";
export type Row = {
  id: string;
  contact_id: string;
  contact_name: string;
  phone: string | null;
  organization: string | null;
  title: string;
  stage_id: string;
  stage_name: string;
  stage_kind: string;
  owner_id: string;
  owner_name: string;
  estimated_value: number | null;
  commercial_availability?: "available" | "reserved" | "consult" | null;
  next_action_type: string | null;
  next_action_at: string | null;
  next_action_note: string | null;
  status: string;
  source: string | null;
  details: string | null;
  last_interaction_at: string | null;
  created_at: string;
  stage_entered_at: string | null;
  waiting_started_at: string | null;
  closed_at?: string | null;
  tags?: string[];
  proposal_url?: string | null;
  contract_url?: string | null;
  drive_url?: string | null;
  win_reason?: string | null;
};
export type Stage = {
  id: string;
  name: string;
  position: number;
  kind: string;
};
export type Contact = {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  organization: string | null;
  created_at: string;
};
type Activity = {
  id: string;
  opportunity_id: string;
  status: string;
  due_at: string;
  type: string;
  note: string | null;
  created_at: string;
};
export type Event = {
  id: string;
  opportunity_id: string;
  event: string;
  description: string;
  created_at: string;
  actor_id: string;
  payload: {
    due_at?: string;
    result?: string;
    note?: string;
    from_name?: string;
    to_name?: string;
  };
};
export type Data = {
  company?: {
    id: string;
    name: string;
    demo: boolean;
    pipelineVersion: number;
  };
  companies?: {
    id: string;
    name: string;
    company_template: TemplateKey;
    is_demo: boolean;
    role: string;
  }[];
  template?: TemplateKey;
  stages: Stage[];
  opportunities: Row[];
  activities: Activity[];
  history: Event[];
  owners: { id: string; display_name: string }[];
  contacts: Contact[];
};
const initial: Data = {
  stages: [],
  opportunities: [],
  activities: [],
  history: [],
  owners: [],
  contacts: [],
};
const day = (s: string) => {
  const p = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date(s));
  const x = (type: string) => p.find((v) => v.type === type)?.value || "";
  return `${x("year")}-${x("month")}-${x("day")}`;
};
const todayKey = () => day(new Date().toISOString());
const formatDate = (s: string | null) =>
  s
    ? new Intl.DateTimeFormat("pt-BR", {
        dateStyle: "short",
        timeStyle: "short",
        timeZone: "America/Sao_Paulo",
      }).format(new Date(s))
    : "—";
const money = (v: number | null) =>
  v == null
    ? "—"
    : new Intl.NumberFormat("pt-BR", {
        style: "currency",
        currency: "BRL",
        maximumFractionDigits: 0,
      }).format(v);
const wa = whatsappUrl;
const greetingForNow = () => {
  const hour = Number(
    new Intl.DateTimeFormat("en-US", {
      timeZone: "America/Bahia",
      hour: "2-digit",
      hourCycle: "h23",
    }).format(new Date()),
  );
  return hour < 12 ? "Bom dia" : hour < 18 ? "Boa tarde" : "Boa noite";
};
const longToday = () => {
  const value = new Intl.DateTimeFormat("pt-BR", {
    weekday: "long",
    day: "2-digit",
    month: "long",
    timeZone: "America/Bahia",
  }).format(new Date());
  return value.charAt(0).toUpperCase() + value.slice(1);
};
export default function Workspace({
  user,
  signOut,
  adminAccess,
  initialTab = "today",
}: {
  user: { name: string; email: string };
  signOut: string;
  adminAccess: boolean;
  initialTab?: "today" | "list" | "pipeline" | "contacts";
}) {
  const [companyId, setCompanyId] = useState<string | null>(null),
    [template, setTemplate] = useState<TemplateKey>("events"),
    [tab, setTab] = useState<"today" | "list" | "pipeline" | "contacts" | "team">(
      initialTab,
    ),
    [data, setData] = useState<Data>(initial),
    [loading, setLoading] = useState(true),
    [error, setError] = useState(""),
    [notice, setNotice] = useState(""),
    [selected, setSelected] = useState<string | null>(null),
    [modal, setModal] = useState<CoreMode | null>(null),
    [quickMode, setQuickMode] = useState(false),
    [search, setSearch] = useState(""),
    [filter, setFilter] = useState("all"),
    [stageFilter, setStageFilter] = useState("all"),
    [ownerFilter, setOwnerFilter] = useState("all"),
    [busy, setBusy] = useState(false),
    [duplicate, setDuplicate] = useState<Duplicate>(null),
    [closingStage, setClosingStage] = useState<Stage | null>(null),
    [queue, setQueue] = useState<{ ids: string[]; resolved: string[] } | null>(
      null,
    ),
    [initialAction, setInitialAction] = useState<string | null>(null),
    [settings, setSettings] = useState(false),
    [contactSelected, setContactSelected] = useState<string | null>(null),
    [globalQuery, setGlobalQuery] = useState(""),
    [notificationOpen, setNotificationOpen] = useState(false),
    [mobileMenuOpen, setMobileMenuOpen] = useState(false),
    [attentionFocused, setAttentionFocused] = useState(false);
  const writeLock = useRef(false),
    retries = useRef(new Map<string, string>()),
    fetchSequence = useRef(0);
  const snapshotReady =
    !!data.company &&
    data.company.id === companyId &&
    data.template === template;
  const changeStage = (opportunity: Row, stageId: string) => {
    const target = data.stages.find((s) => s.id === stageId);
    if (!target) return;
    if (target.kind !== "open") {
      setSelected(opportunity.id);
      setClosingStage(target);
      setModal("close");
    } else void run("stage", { id: opportunity.id, stageId });
  };
  useEffect(() => {
    setDuplicate(null);
    setError("");
  }, [modal]);
  useEffect(() => {
    const key = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !modal && !busy) setSelected(null);
    };
    document.addEventListener("keydown", key);
    return () => document.removeEventListener("keydown", key);
  }, [modal, busy]);
  const fetchData = useCallback(
    async (t: TemplateKey, c: string | null, quiet = false) => {
      const sequence = ++fetchSequence.current;
      if (!quiet) setLoading(true);
      setError("");
      try {
        const params = new URLSearchParams({ template: t });
        if (c) params.set("companyId", c);
        const r = await fetch(`/api/workspace?${params}`, {
            cache: "no-store",
          }),
          j = (await r.json()) as Data & { error?: string };
        if (!r.ok) throw new Error(j.error || "Falha ao carregar");
        if (sequence !== fetchSequence.current) return;
        setData(j);
        if (j.company?.id !== c) setCompanyId(j.company?.id || null);
        if (j.template && j.template !== t) setTemplate(j.template);
      } catch (e) {
        if (sequence === fetchSequence.current)
          setError(e instanceof Error ? e.message : "Falha ao carregar");
      } finally {
        if (sequence === fetchSequence.current) setLoading(false);
      }
    },
    [],
  );
  useEffect(() => {
    // Server normalization already supplied this snapshot; do not fetch it again.
    if (data.company?.id === companyId && data.template === template) return;
    void fetchData(template, companyId);
  }, [template, companyId, fetchData, data.company?.id, data.template]);
  const run = async (kind: string, payload: Record<string, unknown> = {}) => {
    if (writeLock.current) return false;
    writeLock.current = true;
    const fingerprint = JSON.stringify({ kind, id: selected, ...payload });
    const requestId =
      typeof payload.requestId === "string"
        ? payload.requestId
        : retries.current.get(fingerprint) || crypto.randomUUID();
    retries.current.set(fingerprint, requestId);
    setBusy(true);
    setError("");
    setNotice("");
    try {
      const r = await fetch("/api/workspace", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            kind,
            template,
            companyId: data.company?.id,
            id: selected,
            ...payload,
            requestId,
          }),
        }),
        j = (await r.json()) as {
          error?: string;
          id?: string;
          code?: string;
          contact?: NonNullable<Duplicate>;
        };
      if (!r.ok && j.code === "DUPLICATE_CONTACT" && j.contact) {
        setDuplicate(j.contact);
        return false;
      }
      if (r.ok || r.status < 500) retries.current.delete(fingerprint);
      if (!r.ok) throw new Error(j.error || "Falha ao salvar");
      if (kind === "create") setSelected(j.id || null);
      setDuplicate(null);
      setModal(null);
      setQuickMode(false);
      setInitialAction(null);
      await fetchData(template, data.company?.id || null, true);
      if (
        queue &&
        selected &&
        (["complete", "schedule", "reschedule"].includes(kind) ||
          (kind === "stage" &&
            data.stages.find((s) => s.id === payload.stageId)?.kind !== "open"))
      ) {
        const resolved = [...new Set([...queue.resolved, selected])];
        const next = queue.ids.find((id) => !resolved.includes(id));
        setQueue({ ...queue, resolved });
        setSelected(next || null);
      }
      if (kind === "pipeline_configure") setSettings(false);
      setNotice("Alteração salva.");
      return true;
    } catch (e) {
      setError(e instanceof Error ? e.message : "Falha ao salvar");
      return false;
    } finally {
      writeLock.current = false;
      setBusy(false);
    }
  };
  const row = data.opportunities.find((x) => x.id === selected) || null,
    conf = templates[template],
    nowDay = todayKey();
  const open = data.opportunities.filter((x) => x.status === "open");
  const overdue = open.filter(
      (x) => x.next_action_at && Date.parse(x.next_action_at) < Date.now(),
    ),
    due = open.filter(
      (x) =>
        x.next_action_at &&
        Date.parse(x.next_action_at) >= Date.now() &&
        day(x.next_action_at) === nowDay,
    ),
    noAction = open.filter((x) => !x.next_action_at),
    future = open.filter(
      (x) => x.next_action_at && day(x.next_action_at) > nowDay,
    );
  const waiting = open.filter((x) => x.next_action_type === "Aguardar cliente");
  const rawDisplayName = user.name.includes("@")
    ? user.email.split("@")[0].replace(/[._-]+/g, " ")
    : user.name;
  const firstName = rawDisplayName.trim().split(/\s+/)[0] || "cliente";
  const attentionCount = open.filter((r) => priorityRank(r) <= 3).length;
  const attentionRows = open
    .filter((r) => priorityRank(r) <= 3)
    .sort(comparePriority)
    .slice(0, 4);
  const currentRole = data.companies?.find((company) => company.id === data.company?.id)?.role;
  const greeting = greetingForNow(),
    todayLabel = longToday();
  const filtered = useMemo(
    () =>
      data.opportunities
        .filter((x) => {
          if (search && !matchesSearch(x, search)) return false;
          if (stageFilter !== "all" && x.stage_id !== stageFilter) return false;
          if (ownerFilter !== "all" && x.owner_id !== ownerFilter) return false;
          if (filter === "overdue")
            return (
              x.status === "open" &&
              !!x.next_action_at &&
              Date.parse(x.next_action_at) < Date.now()
            );
          if (filter === "today")
            return (
              x.status === "open" &&
              !!x.next_action_at &&
              Date.parse(x.next_action_at) >= Date.now() &&
              day(x.next_action_at) === todayKey()
            );
          if (filter === "week")
            return (
              x.status === "open" &&
              !!x.next_action_at &&
              new Date(x.next_action_at).getTime() <=
                Date.now() + 7 * 86400000 &&
              new Date(x.next_action_at).getTime() >= Date.now() - 86400000
            );
          if (filter === "none")
            return x.status === "open" && !x.next_action_at;
          return true;
        })
        .sort(comparePriority),
    [data.opportunities, search, stageFilter, ownerFilter, filter],
  );
  const activity = (r: Row) =>
    data.activities.find(
      (a) => a.opportunity_id === r.id && a.status === "pending",
    );
  const statusText = (r: Row) =>
    r.status === "won"
      ? "Ganho"
      : r.status === "lost"
        ? "Perdido"
        : !r.next_action_at
          ? "Sem próxima ação"
          : Date.parse(r.next_action_at) < Date.now()
            ? "Vencido"
            : day(r.next_action_at) === nowDay
              ? "Hoje"
              : "Programado";
  return (
    <div className="app">
      <aside className="sidebar">
        <div className="brand">
          <AetherMark size={36} />
          <div>
            <strong>Aether Flow</strong>
            <small>OPERAÇÃO</small>
          </div>
        </div>
        <div className="workspace-label">
          {data.company?.demo ? "MODO DEMONSTRAÇÃO" : "SUA EMPRESA"}
        </div>
        {data.company?.demo ? (
          <label className="select-wrap">
            <span className="sr-only">Selecionar nicho</span>
            <select
              value={template}
              onChange={(e) => {
                setCompanyId(null);
                setTemplate(e.target.value as TemplateKey);
                setSelected(null);
                setFilter("all");
                setStageFilter("all");
              }}
            >
              {Object.entries(templates).map(([key, val]) => (
                <option key={key} value={key}>
                  {val.label}
                </option>
              ))}
            </select>
            <ChevronDown size={15} />
          </label>
        ) : (
          <div className="company-sidebar-name">
            {data.company?.name || "Carregando empresa…"}
          </div>
        )}
        <button
          type="button"
          className="mobile-nav-toggle"
          aria-expanded={mobileMenuOpen}
          aria-controls="workspace-navigation"
          onClick={() => setMobileMenuOpen((open) => !open)}
        >
          <Menu size={18} />
          <span>{mobileMenuOpen ? "Fechar menu" : "Abrir menu"}</span>
          <MoreHorizontal size={16} />
        </button>
        <nav id="workspace-navigation" className={mobileMenuOpen ? "mobile-nav-open" : ""} aria-label="Navegação principal">
          <button
            type="button"
            className="mobile-nav-close"
            aria-label="Fechar menu"
            onClick={() => setMobileMenuOpen(false)}
          >
            <X size={18} /> <span>Menu</span>
          </button>
          <button
            className={tab === "today" && !attentionFocused ? "active" : ""}
            onClick={() => {
              setTab("today");
              setAttentionFocused(false);
              setSelected(null);
              setMobileMenuOpen(false);
            }}
          >
            <CalendarDays size={18} /> Hoje
          </button>
          <button
            className={`alert-nav ${attentionFocused ? "active" : ""}`}
            onClick={() => {
              setTab("today");
              setAttentionFocused(true);
              setSelected(null);
              setMobileMenuOpen(false);
              window.setTimeout(() => document.getElementById("radar-de-atencao")?.scrollIntoView({ behavior: "smooth", block: "start" }), 0);
            }}
            title="Abrir alertas de atenção"
          >
            <Bell size={18} /> Alertas {attentionCount > 0 && <span className="sidebar-alert-count">{attentionCount}</span>}
          </button>
          <button
            className={tab === "list" ? "active" : ""}
            onClick={() => {
              setTab("list");
              setAttentionFocused(false);
              setSelected(null);
              setMobileMenuOpen(false);
            }}
          >
            <LayoutList size={18} /> Oportunidades
          </button>
          <button
            className={tab === "pipeline" ? "active" : ""}
            onClick={() => {
              setTab("pipeline");
              setAttentionFocused(false);
              setSelected(null);
              setMobileMenuOpen(false);
            }}
          >
            <Columns3 size={18} /> Pipeline
          </button>
          <a href="/operacao" onClick={() => setMobileMenuOpen(false)}>
            <Boxes size={18} /> Operação
          </a>
          <a className={tab === "contacts" ? "active" : ""} href="/contatos" onClick={() => setMobileMenuOpen(false)}>
            <Users size={18} /> Contatos
          </a>
          {data.companies?.find((c) => c.id === data.company?.id)?.role === "owner" && (
            <button className={tab === "team" ? "active" : ""} onClick={() => { setTab("team"); setAttentionFocused(false); setSelected(null); setMobileMenuOpen(false); }}>
              <Users size={18} /> Equipe
            </button>
          )}
          <a href="/mensagens" onClick={() => setMobileMenuOpen(false)}>
            <MessageCircle size={18} /> Mensagens
          </a>
          <button type="button" onClick={() => {
            setTab("today");
            setAttentionFocused(false);
            setSelected(null);
            setMobileMenuOpen(false);
            window.setTimeout(() => {
              const panel = document.getElementById("metrics-csv") as HTMLDetailsElement | null;
              if (panel) {
                panel.open = true;
                panel.scrollIntoView({ behavior: "smooth", block: "start" });
              }
            }, 0);
          }}>
            <BarChart3 size={18} /> Métricas e CSV
          </button>
          {adminAccess && (
            <a className="admin-nav" href="/admin">
              Acessos
            </a>
          )}
        </nav>
        <div className="sidebar-bottom">
          {data.company?.demo && (
            <div className="demo-note">
              <span className="demo-dot" /> DEMONSTRAÇÃO
              <p>
                Dados fictícios para apresentar o funcionamento. Alterações são
                salvas na sua conta.
              </p>
            </div>
          )}
          <div className="account">
            <span className="avatar">
              {user.name.slice(0, 1).toUpperCase()}
            </span>
            <div>
              <strong>{user.name}</strong>
              <small>{user.email}</small>
            </div>
            <a href={signOut} title="Sair" aria-label="Sair" target="_top">
              <ArrowUpRight size={17} />
            </a>
          </div>
        </div>
      </aside>
      <main className="content">
        <header className="topbar">
          <div className="crumb">
            {data.company?.name || "Empresa"} <span>/</span> {conf.label}
          </div>
          {snapshotReady && (
            <div className="global-search">
              <label>
                <span className="sr-only">Busca global</span>
                <input
                  aria-label="Busca global"
                  placeholder="Buscar contato, oportunidade ou telefone…"
                  value={globalQuery}
                  onChange={(e) => setGlobalQuery(e.target.value)}
                />
              </label>
              {globalQuery.trim() && (
                <div
                  className="search-results"
                  role="region"
                  aria-label="Resultados da busca global"
                >
                  {data.opportunities
                    .filter((r) => matchesSearch(r, globalQuery))
                    .slice(0, 5)
                    .map((r) => (
                      <button
                        key={r.id}
                        onClick={() => {
                          setSelected(r.id);
                          setGlobalQuery("");
                        }}
                      >
                        {r.contact_name} · {r.title}
                      </button>
                    ))}
                  {data.contacts
                    .filter((c) => matchesSearch(c, globalQuery))
                    .slice(0, 5)
                    .map((c) => (
                      <button
                        key={c.id}
                        onClick={() => {
                          setTab("contacts");
                          setContactSelected(c.id);
                          setGlobalQuery("");
                        }}
                      >
                        {c.name} · Contato
                      </button>
                    ))}
                  {!data.opportunities.some((r) =>
                    matchesSearch(r, globalQuery),
                  ) &&
                    !data.contacts.some((c) =>
                      matchesSearch(c, globalQuery),
                    ) && <p>Nenhum resultado encontrado.</p>}
                  <button onClick={() => setGlobalQuery("")}>
                    Fechar busca
                  </button>
                </div>
              )}
            </div>
          )}
          <div className="topright">
            <div className="notification-wrap">
              <button className="notification-button" type="button" aria-expanded={notificationOpen} aria-label={`${attentionCount} alertas de atenção`} title="Abrir alertas de atenção" onClick={() => setNotificationOpen((value) => !value)}>
                <Bell size={17} /><span>{attentionCount}</span>
              </button>
              {notificationOpen && (
                <div className="notification-popover" role="dialog" aria-label="Alertas de atenção">
                  <div className="notification-popover-head">
                    <div><span className="eyebrow">RADAR DE ATENÇÃO</span><strong>{attentionCount ? `${attentionCount} itens pedem atenção` : "Tudo em dia"}</strong></div>
                    <button type="button" aria-label="Fechar alertas" onClick={() => setNotificationOpen(false)}><X size={15} /></button>
                  </div>
                  {attentionRows.length ? (
                    <div className="notification-list">
                      {attentionRows.map((r) => (
                        <button key={r.id} type="button" className="notification-row" onClick={() => { setTab("today"); setSelected(r.id); setNotificationOpen(false); }}>
                          <span className={`notification-dot ${statusText(r) === "Vencido" ? "late" : statusText(r) === "Hoje" ? "today" : "missing"}`} />
                          <span><strong>{r.contact_name}</strong><small>{statusText(r)} · {r.title}</small></span>
                          <ArrowUpRight size={14} />
                        </button>
                      ))}
                    </div>
                  ) : <p className="notification-empty">Nenhum retorno vencido ou ação pendente agora.</p>}
                  <button type="button" className="notification-all" onClick={() => { setTab("today"); setSelected(null); setNotificationOpen(false); }}>Abrir radar completo <ArrowUpRight size={14} /></button>
                </div>
              )}
            </div>
            <div className="topbar-user"><span className="topbar-user-avatar">{user.name.slice(0, 1).toUpperCase()}</span><span><strong>{firstName}</strong><small>{currentRole === "owner" ? "Administrador" : "Equipe"}</small></span></div>
            {data.company?.demo && (
              <span className="demo-pill">DEMONSTRAÇÃO</span>
            )}
            <span className="today-date">
              {new Intl.DateTimeFormat("pt-BR", {
                dateStyle: "medium",
                timeZone: "America/Sao_Paulo",
              }).format(new Date())}
            </span>
          </div>
        </header>
        <div className="page-body">
          {error && (
            <div role="alert" className="alert error">
              {error}{" "}
              <button
                onClick={() => {
                  setError("");
                  void fetchData(template, companyId);
                }}
              >
                Tentar novamente
              </button>
            </div>
          )}
          {notice && (
            <div role="status" className="alert success">
              {notice}
              <button onClick={() => setNotice("")} aria-label="Fechar aviso">
                <X size={15} />
              </button>
            </div>
          )}
          <div
            className={`heading ${tab === "today" ? "welcome-heading" : ""}`}
          >
            <div>
              {tab === "today" ? (
                <>
                  <div className="eyebrow">CENTRAL DE AÇÕES</div>
                  <h1>
                    {greeting}, {firstName}
                  </h1>
                  <p>
                    Veja o que merece sua atenção e mantenha as oportunidades
                    avançando.
                  </p>
                  <div className="welcome-meta">
                    <span>{todayLabel}</span>
                    {data.company?.name && (
                      <>
                        <i />
                        <span>{data.company.name}</span>
                      </>
                    )}
                    {!loading && (
                      <>
                        <i />
                        <button
                          className="attention-link"
                          type="button"
                          onClick={() => {
                            const ids = pendingQueue(data.opportunities).map((r) => r.id);
                            setQueue({ ids, resolved: [] });
                            setSelected(ids[0] || null);
                          }}
                          aria-label="Abrir itens que pedem atenção"
                        >
                          {attentionCount} {attentionCount === 1 ? "item pede" : "itens pedem"} atenção
                        </button>
                      </>
                    )}
                  </div>
                </>
              ) : (
                <>
                  <div className="eyebrow">
                    {tab === "list" ? "ACOMPANHAMENTO" : tab === "team" ? "ADMINISTRAÇÃO" : "VISÃO DO PROCESSO"}
                  </div>
                  <h1>
                    {tab === "list"
                      ? "Oportunidades"
                      : tab === "contacts"
                        ? "Contatos"
                        : tab === "team"
                          ? "Equipe"
                        : "Pipeline"}
                  </h1>
                  <p>
                    {tab === "team"
                      ? "Adicione funcionários e defina quem pode gerir o atendimento."
                      : tab === "contacts"
                      ? "Clientes e suas oportunidades em um só lugar."
                      : tab === "list"
                        ? `Acompanhe cada ${conf.noun.toLocaleLowerCase("pt-BR")} da primeira conversa à decisão.`
                        : "Mova as oportunidades conforme o processo avança."}
                  </p>
                </>
              )}
            </div>
            {tab !== "team" && <button
              className="primary"
              disabled={
                loading ||
                !snapshotReady ||
                !data.stages.some((stage) => stage.kind === "open")
              }
              onClick={() => {
                if (loading || !snapshotReady) return;
                setSelected(null);
                setModal("create");
              }}
            >
              <Plus size={17} /> Nova oportunidade
            </button>}
            {tab !== "team" && <button
              className="quick-entry-button"
              type="button"
              disabled={loading || !snapshotReady}
              onClick={() => {
                setQuickMode(true);
                setSelected(null);
                setModal("create");
              }}
            >
              <ArrowUpRight size={16} /> Modo rápido
            </button>}
          </div>
          {tab === "today" && snapshotReady && !loading && (
            <FeatureGuide canManageTeam={data.companies?.some((company) => company.id === data.company?.id && company.role === "owner") === true} />
          )}
          {snapshotReady && !loading && tab !== "team" && <BusinessOperations data={data} reload={()=>void fetchData(template,companyId)}/>}
          {tab === "today" && snapshotReady && !loading && (
            <button
              className="primary resolve-queue"
              onClick={() => {
                const ids = pendingQueue(data.opportunities).map((r) => r.id);
                setQueue({ ids, resolved: [] });
                setSelected(ids[0] || null);
              }}
            >
              Resolver pendências
            </button>
          )}
          {queue && (
            <section
              className="queue-progress"
              aria-label="Progresso das pendências"
            >
              <strong>
                {queue.resolved.length} de {queue.ids.length} pendências
                resolvidas
              </strong>
              {queue.resolved.length === queue.ids.length && (
                <span>
                  {queue.ids.length
                    ? "Fila concluída."
                    : "Não há pendências para resolver."}
                </span>
              )}
              <button
                onClick={() => {
                  setQueue(null);
                  setSelected(null);
                }}
              >
                Sair da fila
              </button>
            </section>
          )}
          {loading ? (
            <div className="loading" role="status">
              Carregando oportunidades…
            </div>
          ) : !snapshotReady ? (
            <div className="empty-line" role="status">
              Não foi possível carregar este ambiente.{" "}
              <button
                className="text-button"
                onClick={() => void fetchData(template, companyId)}
              >
                Tentar novamente
              </button>
            </div>
          ) : tab === "team" ? (
            <Team companyId={data.company!.id} canManage={data.companies?.find((c) => c.id === data.company!.id)?.role === "owner"} />
          ) : tab === "contacts" ? (
            <Contacts
              data={data}
              selected={contactSelected}
              onSelect={setContactSelected}
              openOpportunity={(id) => {
                setContactSelected(null);
                setSelected(id);
              }}
              create={() => {
                setContactSelected(null);
                setSelected(null);
                setModal("create");
              }}
              refresh={() => void fetchData(template, data.company!.id, true)}
            />
          ) : tab === "today" && !data.opportunities.length ? (
            <section className="first-opportunity">
              <h2>Comece em 3 passos</h2>
              <ol>
                <li>Cadastre sua primeira oportunidade.</li>
                <li>Defina o próximo passo.</li>
                <li>Acompanhe tudo em Hoje.</li>
              </ol>
              <button className="primary" onClick={() => setModal("create")}>
                Criar primeira oportunidade
              </button>
            </section>
          ) : tab === "today" ? (
            <Dashboard
              data={data}
              rows={data.opportunities}
              today={nowDay}
              open={(r) => setSelected(r.id)}
              complete={(r) => {
                const activity = data.activities.find(
                  (a) => a.opportunity_id === r.id && a.status === "pending",
                );
                if (activity) {
                  setSelected(r.id);
                  setModal("complete");
                }
              }}
              reschedule={(r) => {
                setSelected(r.id);
                setModal(r.next_action_at ? "reschedule" : "schedule");
              }}
              viewList={(f) => {
                setTab("list");
                setFilter(f);
              }}
              onWhatsAppRecorded={() =>
                void fetchData(template, data.company!.id, true)
              }
              wa={wa}
              formatDate={formatDate}
              money={money}
            />
          ) : tab === "list" ? (
            <>
              <div className="filters">
                <label className="search">
                  <Search size={17} />
                  <input
                    placeholder="Buscar cliente ou oportunidade"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label>
                  <SlidersHorizontal size={16} />
                  <select
                    aria-label="Filtrar por prazo"
                    value={filter}
                    onChange={(e) => setFilter(e.target.value)}
                  >
                    <option value="all">Todos os prazos</option>
                    <option value="overdue">Vencidos</option>
                    <option value="today">Hoje</option>
                    <option value="week">Esta semana</option>
                    <option value="none">Sem próxima ação</option>
                  </select>
                </label>
                <label>
                  <select
                    aria-label="Filtrar por estágio"
                    value={stageFilter}
                    onChange={(e) => setStageFilter(e.target.value)}
                  >
                    <option value="all">Todos os estágios</option>
                    {data.stages.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  <select
                    aria-label="Filtrar por responsável"
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                  >
                    <option value="all">Todos os responsáveis</option>
                    {data.owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.display_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="table-wrap">
                <table>
                  <thead>
                    <tr>
                      <th>Cliente / oportunidade</th>
                      <th>Tipo</th>
                      <th>Valor</th>
                      <th>Estágio</th>
                      <th>Responsável</th>
                      <th>Última interação</th>
                      <th>Próxima ação</th>
                      <th>Status</th>
                      <th>Contato</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filtered.map((r) => (
                      <tr
                        key={r.id}
                        onClick={() => setSelected(r.id)}
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === "Enter") setSelected(r.id);
                        }}
                      >
                        <td>
                          <strong>{r.contact_name}</strong>
                          <small>{formatPhone(r.phone)}</small>
                        </td>
                        <td>{r.title}</td>
                        <td>{money(r.estimated_value)}</td>
                        <td>
                          {r.stage_name}
                          <StageElapsed row={r} />
                        </td>
                        <td>{r.owner_name}</td>
                        <td>
                          {formatDate(r.last_interaction_at)}
                          <StaleIndicator date={r.last_interaction_at} />
                        </td>
                        <td>
                          {r.next_action_type || "—"}
                          <small>{formatDate(r.next_action_at)}</small>
                        </td>
                        <td>
                          <span
                            className={`state ${statusText(r) === "Vencido" ? "late" : ""}`}
                          >
                            {statusText(r)}
                          </span>
                        </td>
                        <td className="whatsapp-cell">
                          {wa(r.phone) ? (
                            <WhatsAppAction
                              className="whatsapp-button compact"
                              companyId={data.company!.id}
                              opportunityId={r.id}
                              phone={r.phone}
                              name={r.contact_name}
                              compact={false}
                              onRecorded={() =>
                                void fetchData(template, data.company!.id, true)
                              }
                            />
                          ) : (
                            <span className="no-whatsapp">Sem número</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {!filtered.length && (
                  <div className="empty-table">
                    Nenhuma oportunidade corresponde aos filtros.
                  </div>
                )}
              </div>
            </>
          ) : (
            <>
              {(adminAccess ||
                data.companies?.find((c) => c.id === data.company!.id)?.role ===
                  "owner") && (
                <button
                  className="text-button"
                  onClick={() => {
                    setError("");
                    setSettings(true);
                  }}
                >
                  Configurar pipeline
                </button>
              )}
              <div className="pipeline-filters">
                <label>
                  <Search size={17} />
                  <input
                    placeholder="Buscar no pipeline"
                    value={search}
                    onChange={(e) => setSearch(e.target.value)}
                  />
                </label>
                <label>
                  Responsável{" "}
                  <select
                    value={ownerFilter}
                    onChange={(e) => setOwnerFilter(e.target.value)}
                  >
                    <option value="all">Todos</option>
                    {data.owners.map((o) => (
                      <option key={o.id} value={o.id}>
                        {o.display_name}
                      </option>
                    ))}
                  </select>
                </label>
              </div>
              <div className="board">
                {data.stages.map((s) => (
                  <section className="column" key={s.id}>
                    <header>
                      <span className={`stage-dot ${s.kind}`} />
                      <strong>{s.name}</strong>
                      <span>
                        {filtered.filter((r) => r.stage_id === s.id).length}
                      </span>
                    </header>
                    <div className="column-content">
                      {filtered
                        .filter((r) => r.stage_id === s.id)
                        .map((r) => (
                          <article className="kanban-card" key={r.id}>
                            <button
                              className="card-open"
                              onClick={() => setSelected(r.id)}
                            >
                              <strong>{r.contact_name}</strong>
                              <span>{r.title}</span>
                              <small>
                                {money(r.estimated_value)} · {r.owner_name}
                              </small>
                            </button>
                            <StaleIndicator date={r.last_interaction_at} />
                            <StageElapsed row={r} />
                            <div className="card-footer">
                              <div className="card-contact-row">
                                <span>
                                  {r.next_action_at
                                    ? formatDate(r.next_action_at)
                                    : "Sem próxima ação"}
                                </span>
                                {wa(r.phone) && (
                                  <WhatsAppAction
                                    className="whatsapp-icon-button"
                                    companyId={data.company!.id}
                                    opportunityId={r.id}
                                    phone={r.phone}
                                    name={r.contact_name}
                                    compact={true}
                                    onRecorded={() =>
                                      void fetchData(
                                        template,
                                        data.company!.id,
                                        true,
                                      )
                                    }
                                  />
                                )}
                              </div>
                              <select
                                aria-label={`Mover ${r.contact_name} para estágio`}
                                value={r.stage_id}
                                disabled={busy}
                                onChange={(e) => {
                                  changeStage(r, e.target.value);
                                }}
                              >
                                {data.stages.map((opt) => (
                                  <option key={opt.id} value={opt.id}>
                                    {opt.name}
                                  </option>
                                ))}
                              </select>
                            </div>
                          </article>
                        ))}
                      {!filtered.some((r) => r.stage_id === s.id) && (
                        <div className="column-empty">Nenhuma oportunidade</div>
                      )}
                    </div>
                  </section>
                ))}
              </div>
              {!data.opportunities.length && (
                <section className="first-opportunity">
                  <h2>Seu pipeline está pronto para começar</h2>
                  <button
                    className="primary"
                    onClick={() => setModal("create")}
                  >
                    Criar primeira oportunidade
                  </button>
                </section>
              )}
            </>
          )}
          {snapshotReady && !loading && (
            <ProductFeedback companyId={data.company!.id} context={tab} />
          )}
        </div>
      </main>
      {row && (
        <div
          aria-hidden={!!modal}
          className="overlay"
          onMouseDown={(e) => {
            if (e.target === e.currentTarget && !queue) setSelected(null);
          }}
        >
          <aside
            className="detail"
            role="dialog"
            aria-modal="true"
            aria-label={`Detalhes de ${row.contact_name}`}
          >
            <div className="detail-head">
              <span className="eyebrow">
                {conf.noun.toUpperCase()}
                {data.company?.demo ? " · DEMONSTRAÇÃO" : ""}
              </span>
              <button
                className="icon-btn"
                aria-label="Fechar detalhes"
                onClick={() => {
                  setSelected(null);
                  setQueue(null);
                }}
              >
                <X size={20} />
              </button>
            </div>
            <h2>{row.contact_name}</h2>
            <p className="detail-sub">{row.title}</p>
            <StaleIndicator date={row.last_interaction_at} />
            <StageElapsed row={row} />
            {queue && (
              <div className="queue-quick-actions">
                <strong>
                  {queue.resolved.length} de {queue.ids.length} resolvidas
                </strong>
                {row.status === "open" && (
                  <>
                    <button
                      onClick={() => {
                        setInitialAction("Aguardar cliente");
                        setModal(
                          row.next_action_at ? "reschedule" : "schedule",
                        );
                      }}
                    >
                      Aguardar cliente
                    </button>
                    {(["won", "lost"] as const).map((kind) => (
                      <button
                        key={kind}
                        onClick={() => {
                          setClosingStage(
                            data.stages.find((s) => s.kind === kind) || null,
                          );
                          setModal("close");
                        }}
                      >
                        {kind === "won" ? "Marcar ganho" : "Marcar perdido"}
                      </button>
                    ))}
                  </>
                )}
              </div>
            )}
            <div className="detail-controls">
              <button onClick={() => setModal("edit")}>Editar dados</button>
              <button type="button" onClick={async () => {
                const summary = [`Aether Flow · ${row.contact_name}`, row.title, `Etapa: ${row.stage_name}`, `Valor: ${money(row.estimated_value)}`, `Responsável: ${row.owner_name}`, `Próximo passo: ${row.next_action_type || "Definir ação"}`].join("\n");
                try {
                  if (navigator.share) await navigator.share({ title: `Aether Flow · ${row.contact_name}`, text: summary });
                  else { await navigator.clipboard.writeText(summary); setNotice("Resumo copiado para compartilhar."); }
                } catch { setNotice("Resumo pronto para compartilhar."); }
              }}><Share2 size={14} /> Compartilhar resumo</button>
              {wa(row.phone) && (
                <WhatsAppAction
                  className="whatsapp-button"
                  companyId={data.company!.id}
                  opportunityId={row.id}
                  phone={row.phone}
                  name={row.contact_name}
                  compact={false}
                  onRecorded={() =>
                    void fetchData(template, data.company!.id, true)
                  }
                />
              )}
            </div>
            <div className="message-tools">
              <details>
                <summary>Preparar mensagem</summary>
                <p>{messageTemplate(row.contact_name, row.title)}</p>
                <button type="button" onClick={async () => { try { await navigator.clipboard.writeText(messageTemplate(row.contact_name, row.title)); setNotice("Mensagem copiada."); } catch { setError("Não foi possível copiar. Selecione o texto acima."); } }}>
                  Copiar mensagem
                </button>
                <WhatsAppAction companyId={data.company!.id} opportunityId={row.id} phone={row.phone} name={row.contact_name} message={messageTemplate(row.contact_name, row.title)} onRecorded={() => void fetchData(template, data.company!.id, true)} />
              </details>
            </div>
            <MessageBank companyId={data.company!.id} opportunityId={row.id} phone={row.phone} name={row.contact_name} title={row.title} />
            <div className="detail-grid">
              <div>
                <span>Telefone</span>
                <strong>{formatPhone(row.phone)}</strong>
              </div>
              <div>
                <span>Empresa</span>
                <strong>{row.organization || "Não informada"}</strong>
              </div>
              <div>
                <span>Origem</span>
                <strong>{row.source || "Não informada"}</strong>
              </div>
              <div>
                <span>Responsável</span>
                <strong>{row.owner_name}</strong>
              </div>
              <div>
                <span>Valor estimado</span>
                <strong>{money(row.estimated_value)}</strong>
              </div>
              <div>
                <span>Disponibilidade comercial</span>
                <strong>{row.commercial_availability === "available" ? "Disponível" : row.commercial_availability === "reserved" ? "Reservado" : row.commercial_availability === "consult" ? "Sob consulta" : "Sem indicação"}</strong>
              </div>
              <div>
                <span>Último contato</span>
                <strong>{formatDate(row.last_interaction_at)}</strong>
              </div>
            </div>
            {(row.tags?.length || row.proposal_url || row.contract_url || row.drive_url || row.win_reason) && (
              <div className="detail-metadata" aria-label="Metadados da oportunidade">
                {row.tags?.map((tag) => <span className="opportunity-tag" key={tag}>{tag}</span>)}
                {row.win_reason && <span className="metadata-note">Ganho por: {row.win_reason}</span>}
                {row.proposal_url && <a href={row.proposal_url} target="_blank" rel="noreferrer">Proposta ↗</a>}
                {row.contract_url && <a href={row.contract_url} target="_blank" rel="noreferrer">Contrato ↗</a>}
                {row.drive_url && <a href={row.drive_url} target="_blank" rel="noreferrer">Drive ↗</a>}
              </div>
            )}
            {row.details && <p className="details-note">{row.details}</p>}
            <div className="detail-section">
              <h3>Estágio atual</h3>
              <select
                value={row.stage_id}
                disabled={busy}
                onChange={(e) => changeStage(row, e.target.value)}
              >
                {data.stages.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="detail-section">
              <div className="section-head">
                <h3>Próxima ação</h3>
                {row.status === "open" && (
                  <button
                    className="text-button"
                    onClick={() =>
                      setModal(row.next_action_at ? "reschedule" : "schedule")
                    }
                  >
                    {row.next_action_at ? "Reagendar" : "Agendar"}
                  </button>
                )}
              </div>
              {row.next_action_at ? (
                <div className="action-box">
                  <strong>{row.next_action_type}</strong>
                  <span>{formatDate(row.next_action_at)}</span>
                  {row.next_action_type === "Aguardar cliente" && (
                    <p>
                      Aguardando desde {formatDate(row.waiting_started_at)}.
                      Revisão obrigatória em {formatDate(row.next_action_at)}.
                    </p>
                  )}
                  {row.next_action_note && <p>{row.next_action_note}</p>}
                  {activity(row) && (
                    <button
                      onClick={() => setModal("complete")}
                      disabled={busy}
                    >
                      <Check size={16} /> Concluir ação
                    </button>
                  )}
                </div>
              ) : (
                <p className="empty-line">Nenhuma próxima ação agendada.</p>
              )}
            </div>
            <div className="detail-section">
              <h3>Histórico</h3>
              <OperationalTimeline
                events={data.history.filter((h) => h.opportunity_id === row.id)}
                owners={data.owners}
              />
              <CommentForm
                disabled={busy}
                submit={(comment) => run("comment", { comment })}
              />
            </div>
          </aside>
        </div>
      )}
      {modal && (
        <CoreForm
          key={`${modal}-${selected}-${template}`}
          mode={modal}
          row={row}
          data={data}
          busy={busy}
          error={error}
          duplicate={duplicate}
          closingStage={closingStage}
          initialActionType={initialAction}
          onDuplicateReset={() => setDuplicate(null)}
          onClose={() => {
            setModal(null);
            setQuickMode(false);
            setDuplicate(null);
            setClosingStage(null);
            setInitialAction(null);
            setError("");
          }}
          onOpenOpportunity={(id) => {
            setModal(null);
            setSelected(id);
          }}
          onSave={(payload) =>
            run(modal === "close" ? "stage" : modal, payload)
          }
          quick={quickMode && modal === "create"}
        />
      )}
      {settings && snapshotReady && (
        <PipelineSettings
          stages={data.stages}
          busy={busy}
          error={error}
          onClose={() => setSettings(false)}
          onSave={(stages) =>
            run("pipeline_configure", {
              expectedVersion: data.company!.pipelineVersion,
              stages,
            })
          }
        />
      )}
    </div>
  );
}
function StageElapsed({ row }: { row: Row }) {
  const days = elapsedDays(row.stage_entered_at);
  return (
    <small
      className={`stage-elapsed ${days !== null && days >= STAGE_STALE_DAYS ? "attention" : ""}`}
    >
      {days === null
        ? "Entrada no estágio não registrada"
        : `Há ${days} ${days === 1 ? "dia" : "dias"} neste estágio`}
    </small>
  );
}
function CommentForm({
  disabled,
  submit,
}: {
  disabled: boolean;
  submit: (s: string) => Promise<boolean>;
}) {
  const [text, setText] = useState("");
  return (
    <form
      className="comment-form"
      onSubmit={async (e) => {
        e.preventDefault();
        if (await submit(text)) setText("");
      }}
    >
      <input
        aria-label="Adicionar observação ao histórico"
        placeholder="Registrar uma observação…"
        value={text}
        onChange={(e) => setText(e.target.value)}
        maxLength={500}
      />
      <button disabled={disabled || !text.trim()} type="submit">
        Adicionar
      </button>
    </form>
  );
}
