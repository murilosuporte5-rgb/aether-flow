"use client";

import { Bell, CalendarDays, Columns3, LayoutList, MessageCircle, Search, Users } from "lucide-react";
import { useState } from "react";
import Dashboard from "../dashboard";
import Contacts from "../contacts";
import type { Data, Row } from "../workspace";

export type DemoView = "panel" | "alerts" | "contacts" | "pipeline" | "team";

const companyId = "00000000-0000-4000-8000-000000000001";
const ownerId = "00000000-0000-4000-8000-000000000002";
const joaoId = "00000000-0000-4000-8000-000000000003";
const anaId = "00000000-0000-4000-8000-000000000004";
const contactIds = [
  "00000000-0000-4000-8000-000000000011",
  "00000000-0000-4000-8000-000000000012",
  "00000000-0000-4000-8000-000000000013",
  "00000000-0000-4000-8000-000000000014",
];
const opportunityIds = [
  "00000000-0000-4000-8000-000000000021",
  "00000000-0000-4000-8000-000000000022",
  "00000000-0000-4000-8000-000000000023",
  "00000000-0000-4000-8000-000000000024",
  "00000000-0000-4000-8000-000000000025",
  "00000000-0000-4000-8000-000000000026",
];

const stages = [
  { id: "stage-new", name: "Novo", position: 1, kind: "open" },
  { id: "stage-analysis", name: "Em análise", position: 2, kind: "open" },
  { id: "stage-proposal", name: "Proposta", position: 3, kind: "open" },
  { id: "stage-negotiation", name: "Em negociação", position: 4, kind: "open" },
  { id: "stage-won", name: "Fechado", position: 5, kind: "won" },
  { id: "stage-lost", name: "Perdido", position: 6, kind: "lost" },
];

// Keep the public capture deterministic so server and browser render the same
// timestamps and the landing images do not change from one build to another.
const today = new Date("2026-10-01T12:00:00-03:00");
const iso = (offsetHours: number) => new Date(today.getTime() + offsetHours * 3600000).toISOString();
const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Bahia" }).format(today);

const demoData: Data = {
  company: { id: companyId, name: "Aether Works", demo: true, pipelineVersion: 1 },
  companies: [{ id: companyId, name: "Aether Works", company_template: "events", is_demo: true, role: "owner" }],
  template: "events",
  stages,
  owners: [
    { id: ownerId, display_name: "Marina Alves" },
    { id: joaoId, display_name: "João Oliveira" },
    { id: anaId, display_name: "Ana Costa" },
  ],
  contacts: [
    { id: contactIds[0], name: "Mariana Souza", phone: "71988880001", email: "mariana@exemplo.com", organization: "Studio Aurora", created_at: iso(-240) },
    { id: contactIds[1], name: "Empresa Horizonte", phone: "71988880002", email: "compras@horizonte.exemplo", organization: "Horizonte Serviços", created_at: iso(-180) },
    { id: contactIds[2], name: "Carlos Almeida", phone: "71988880003", email: null, organization: "Carlos Almeida", created_at: iso(-120) },
    { id: contactIds[3], name: "Grupo Aurora", phone: "71988880004", email: "contato@aurora.exemplo", organization: "Grupo Aurora", created_at: iso(-72) },
  ],
  opportunities: [
    { id: opportunityIds[0], contact_id: contactIds[0], contact_name: "Mariana Souza", phone: "71988880001", organization: "Studio Aurora", title: "Proposta comercial", stage_id: "stage-proposal", stage_name: "Proposta", stage_kind: "open", owner_id: joaoId, owner_name: "João Oliveira", estimated_value: 4800, next_action_type: "Ligar", next_action_at: iso(3), next_action_note: "Confirmar escopo", status: "open", source: "Indicação", details: "Proposta enviada após a conversa inicial.", last_interaction_at: iso(-20), created_at: iso(-80), stage_entered_at: iso(-48), waiting_started_at: iso(-24) },
    { id: opportunityIds[1], contact_id: contactIds[1], contact_name: "Empresa Horizonte", phone: "71988880002", organization: "Horizonte Serviços", title: "Projeto sob medida", stage_id: "stage-negotiation", stage_name: "Em negociação", stage_kind: "open", owner_id: ownerId, owner_name: "Marina Alves", estimated_value: 8200, next_action_type: "Retorno", next_action_at: iso(-28), next_action_note: "Retomar condições", status: "open", source: "Site", details: "Cliente pediu retorno sobre prazo.", last_interaction_at: iso(-52), created_at: iso(-130), stage_entered_at: iso(-72), waiting_started_at: iso(-28) },
    { id: opportunityIds[2], contact_id: contactIds[2], contact_name: "Carlos Almeida", phone: "71988880003", organization: "Carlos Almeida", title: "Pedido de orçamento", stage_id: "stage-analysis", stage_name: "Em análise", stage_kind: "open", owner_id: anaId, owner_name: "Ana Costa", estimated_value: 2900, next_action_type: "Revisar", next_action_at: iso(28), next_action_note: "Enviar opções", status: "open", source: "WhatsApp", details: "Aguardando dados do serviço.", last_interaction_at: iso(-8), created_at: iso(-56), stage_entered_at: iso(-30), waiting_started_at: null },
    { id: opportunityIds[3], contact_id: contactIds[3], contact_name: "Grupo Aurora", phone: "71988880004", organization: "Grupo Aurora", title: "Revisão de proposta", stage_id: "stage-proposal", stage_name: "Proposta", stage_kind: "open", owner_id: joaoId, owner_name: "João Oliveira", estimated_value: 6500, next_action_type: null, next_action_at: null, next_action_note: null, status: "open", source: "Evento", details: "Definir o próximo contato.", last_interaction_at: iso(-96), created_at: iso(-92), stage_entered_at: iso(-60), waiting_started_at: null },
    { id: opportunityIds[4], contact_id: contactIds[0], contact_name: "Mariana Souza", phone: "71988880001", organization: "Studio Aurora", title: "Serviço fechado", stage_id: "stage-won", stage_name: "Fechado", stage_kind: "won", owner_id: ownerId, owner_name: "Marina Alves", estimated_value: 3100, next_action_type: null, next_action_at: null, next_action_note: null, status: "won", source: "Indicação", details: "Serviço concluído.", last_interaction_at: iso(-120), created_at: iso(-210), stage_entered_at: iso(-96), waiting_started_at: null, closed_at: iso(-36) },
    { id: opportunityIds[5], contact_id: contactIds[1], contact_name: "Empresa Horizonte", phone: "71988880002", organization: "Horizonte Serviços", title: "Orçamento anterior", stage_id: "stage-lost", stage_name: "Perdido", stage_kind: "lost", owner_id: anaId, owner_name: "Ana Costa", estimated_value: 1900, next_action_type: null, next_action_at: null, next_action_note: null, status: "lost", source: "Site", details: "Cliente escolheu outro fornecedor.", last_interaction_at: iso(-170), created_at: iso(-260), stage_entered_at: iso(-190), waiting_started_at: null, closed_at: iso(-150) },
  ],
  activities: [
    { id: "activity-1", opportunity_id: opportunityIds[0], status: "pending", due_at: iso(3), type: "Ligar", note: "Confirmar escopo", created_at: iso(-4) },
    { id: "activity-2", opportunity_id: opportunityIds[1], status: "pending", due_at: iso(-28), type: "Retorno", note: "Retomar condições", created_at: iso(-36) },
    { id: "activity-3", opportunity_id: opportunityIds[2], status: "pending", due_at: iso(28), type: "Revisar", note: "Enviar opções", created_at: iso(-10) },
  ],
  history: [
    { id: "event-1", opportunity_id: opportunityIds[0], event: "created", description: "Oportunidade criada", created_at: iso(-80), actor_id: joaoId, payload: {} },
    { id: "event-2", opportunity_id: opportunityIds[0], event: "activity_completed", description: "Conversa registrada", created_at: iso(-20), actor_id: joaoId, payload: { note: "Cliente confirmou interesse" } },
    { id: "event-3", opportunity_id: opportunityIds[4], event: "won", description: "Venda ganha", created_at: iso(-36), actor_id: ownerId, payload: { result: "Fechado" } },
    { id: "event-4", opportunity_id: opportunityIds[5], event: "lost", description: "Venda perdida", created_at: iso(-150), actor_id: anaId, payload: { result: "Perdido" } },
  ],
};

const copy: Record<DemoView, [string, string]> = {
  panel: ["Bom dia, Marina", "Veja o que merece sua atenção e mantenha as oportunidades avançando."],
  alerts: ["Radar de atenção", "Retornos, compromissos e oportunidades sem próximo passo em uma fila só."],
  contacts: ["Contatos", "Clientes e suas oportunidades em um só lugar."],
  pipeline: ["Pipeline", "Mova as oportunidades conforme o processo avança."],
  team: ["Equipe", "Defina responsáveis e mantenha cada atendimento acompanhado."],
};

function noop() {}

function PipelineDemo() {
  return <div className="board demo-board">{stages.slice(0, 5).map((stage) => <section className="column" key={stage.id}><header><span className={`stage-dot ${stage.kind}`} /><strong>{stage.name}</strong><span>{demoData.opportunities.filter((row) => row.stage_id === stage.id).length}</span></header><div className="column-content">{demoData.opportunities.filter((row) => row.stage_id === stage.id).map((row) => <article className="kanban-card" key={row.id}><button type="button" className="card-open"><strong>{row.contact_name}</strong><span>{row.title}</span><small>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(row.estimated_value || 0)} · {row.owner_name}</small></button><div className="card-footer"><span>{row.next_action_at ? "Próxima ação agendada" : "Sem próxima ação"}</span><select aria-label={`Estágio de ${row.contact_name}`} defaultValue={row.stage_id}><option value={row.stage_id}>{row.stage_name}</option></select></div></article>)}</div></section>)}</div>;
}

function TeamDemo() {
  const members = [
    ["M", "Marina Alves", "marina@aether.exemplo", "Administrador", "owner"],
    ["J", "João Oliveira", "joao@aether.exemplo", "Gestor", "manager"],
    ["A", "Ana Costa", "ana@aether.exemplo", "Funcionário", "member"],
  ];
  return <section className="team-panel"><div className="section-head"><div><span className="eyebrow">EQUIPE</span><h2>Quem atende seus clientes</h2></div><span className="team-limit">2/3 funcionários</span></div><p className="team-intro">Adicione até três funcionários, defina a função e acompanhe quem ficou responsável por cada oportunidade.</p><div className="team-form demo-team-form"><label>Nome<input value="" placeholder="João da Silva" readOnly /></label><label>E-mail<input value="" placeholder="joao@empresa.com" readOnly /></label><label>Função<select defaultValue="member"><option value="member">Funcionário</option><option value="manager">Gestor</option></select></label><button className="primary" type="button">Adicionar funcionário</button></div><div className="team-list">{members.map(([initial, name, email, role, kind]) => <article className="team-member" key={email}><span className="owner-avatar">{initial}</span><div><strong>{name}</strong><small>{email}</small></div><span className={`team-role ${kind}`}>{role}</span>{kind !== "owner" && <span className="text-button">Responsável</span>}</article>)}</div></section>;
}

export default function DemoWorkspace({ view }: { view: DemoView }) {
  const [selectedContact, setSelectedContact] = useState<string | null>(null);
  const [selectedRow, setSelectedRow] = useState<Row | null>(null);
  const [activeTab, setActiveTab] = useState<DemoView>(view);
  const currentCopy = copy[activeTab];
  const nav = (next: DemoView) => { setActiveTab(next); setSelectedContact(null); setSelectedRow(null); };
  const rows = demoData.opportunities;
  return <div className="app demo-readonly" id="demo-screen" data-demo-view={activeTab}>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">A</span><div><strong>Aether Flow</strong><small>OPERAÇÃO</small></div></div>
      <div className="workspace-label">SUA EMPRESA</div><div className="company-sidebar-name">Aether Works</div>
      <nav aria-label="Navegação principal">
        <button type="button" className={activeTab === "panel" ? "active" : ""} onClick={() => nav("panel")}><CalendarDays size={18} /> Hoje</button>
        <button type="button" className={`alert-nav ${activeTab === "alerts" ? "active" : ""}`} onClick={() => nav("alerts")}><Bell size={18} /> Alertas <span className="sidebar-alert-count">3</span></button>
        <button type="button" className={activeTab === "pipeline" ? "active" : ""} onClick={() => nav("pipeline")}><Columns3 size={18} /> Pipeline</button>
        <button type="button" className={activeTab === "contacts" ? "active" : ""} onClick={() => nav("contacts")}><Users size={18} /> Contatos</button>
        <button type="button" className={activeTab === "team" ? "active" : ""} onClick={() => nav("team")}><Users size={18} /> Equipe</button>
        <button type="button"><MessageCircle size={18} /> Mensagens</button>
      </nav>
      <div className="sidebar-bottom"><div className="demo-note"><span className="demo-dot" /> DEMONSTRAÇÃO<p>Dados fictícios para conhecer o funcionamento sem alterar uma conta real.</p></div><div className="account"><span className="avatar">M</span><div><strong>Marina Alves</strong><small>marina@aether.exemplo</small></div></div></div>
    </aside>
    <main className="content">
      <header className="topbar"><div className="crumb">Aether Works <span>/</span> {activeTab === "panel" ? "Hoje" : currentCopy[0]}</div><div className="global-search"><label><span className="sr-only">Busca global</span><Search size={16} /><input aria-label="Buscar contato, oportunidade ou telefone" placeholder="Buscar contato, oportunidade ou telefone…" /></label></div><div className="topright"><button className="notification-button" type="button" aria-label="3 alertas de atenção"><Bell size={17} /><span>3</span></button><div className="topbar-user"><span className="topbar-user-avatar">M</span><span><strong>Marina</strong><small>Administrador</small></span></div><span className="demo-pill">DEMONSTRAÇÃO</span></div></header>
      <div className="page-body">
        <div className={`heading ${activeTab === "panel" ? "welcome-heading" : ""}`}><div><div className="eyebrow">{activeTab === "team" ? "ADMINISTRAÇÃO" : activeTab === "pipeline" ? "VISÃO DO PROCESSO" : "CENTRAL DE AÇÕES"}</div><h1>{currentCopy[0]}</h1><p>{currentCopy[1]}</p><div className="welcome-meta"><span>Hoje, {dayKey}</span><i /><span>Aether Works</span><i /><button className="attention-link" type="button">3 itens pedem atenção</button></div></div>{activeTab !== "team" && <button className="primary" type="button">+ Nova oportunidade</button>}</div>
        {activeTab === "panel" && <Dashboard data={demoData} rows={rows} today={dayKey} open={setSelectedRow} complete={noop} reschedule={noop} viewList={noop} wa={() => null} formatDate={(date) => date ? new Intl.DateTimeFormat("pt-BR", { dateStyle: "short", timeStyle: "short", timeZone: "America/Bahia" }).format(new Date(date)) : "—"} money={(value) => new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 }).format(value || 0)} onWhatsAppRecorded={noop} />}
        {activeTab === "alerts" && <><div className="signal-grid"><div className="signal-card danger"><span className="signal-icon">!</span><span className="signal-label">Retornos vencidos</span><strong>1</strong><small>Empresa Horizonte · ontem</small></div><div className="signal-card blue"><span className="signal-icon">◉</span><span className="signal-label">Ações para hoje</span><strong>1</strong><small>Mariana Souza · 14:30</small></div><div className="signal-card amber"><span className="signal-icon">↗</span><span className="signal-label">Sem próximo passo</span><strong>1</strong><small>Grupo Aurora · proposta</small></div><div className="signal-card neutral"><span className="signal-icon">◌</span><span className="signal-label">Aguardando decisão</span><strong>2</strong><small>R$ 14.700 em movimento</small></div></div><section className="priority-panel"><div className="panel-heading"><div><span className="eyebrow">FILA DE TRABALHO</span><h3>Alertas ordenados pela urgência</h3></div><button type="button">Resolver pendências →</button></div><div className="priority-row"><div className="priority-stripe late" /><div className="priority-info"><div className="priority-name"><button type="button">Empresa Horizonte</button><span className="state late">Vencido</span></div><p>Projeto sob medida <span>·</span> Em negociação</p><div className="priority-sub"><span>Retorno · ontem</span><span>Marina Alves</span></div></div><div className="priority-actions"><button type="button" aria-label="Abrir alerta">→</button><button type="button" aria-label="Agendar retorno">◷</button></div></div><div className="priority-row"><div className="priority-stripe due" /><div className="priority-info"><div className="priority-name"><button type="button">Mariana Souza</button><span className="state today">Hoje</span></div><p>Proposta comercial <span>·</span> Proposta</p><div className="priority-sub"><span>Ligar · hoje 14:30</span><span>João Oliveira</span></div></div><div className="priority-actions"><button type="button" aria-label="Abrir alerta">→</button><button type="button" aria-label="Concluir ação">✓</button></div></div></section></>}
        {activeTab === "contacts" && <Contacts data={demoData} selected={selectedContact} onSelect={setSelectedContact} openOpportunity={(id) => setSelectedRow(demoData.opportunities.find((row) => row.id === id) || null)} create={noop} refresh={noop} />}
        {activeTab === "pipeline" && <><div className="pipeline-filters"><label><Search size={17} /><input placeholder="Buscar no pipeline" readOnly /></label><label>Responsável <select defaultValue="all"><option value="all">Todos</option><option value={joaoId}>João Oliveira</option></select></label></div><PipelineDemo /></>}
        {activeTab === "team" && <TeamDemo />}
        <p className="panel-footnote">Captura de demonstração com dados fictícios. A operação real mantém dados separados por empresa e permissões por função.</p>
      </div>
    </main>
    {selectedRow && <div className="overlay" onMouseDown={(event) => { if (event.target === event.currentTarget) setSelectedRow(null); }}><aside className="detail" role="dialog" aria-modal="true" aria-label={`Detalhes de ${selectedRow.contact_name}`}><div className="detail-head"><span className="eyebrow">OPORTUNIDADE · DEMONSTRAÇÃO</span><button className="icon-btn" type="button" aria-label="Fechar detalhes" onClick={() => setSelectedRow(null)}>×</button></div><h2>{selectedRow.contact_name}</h2><p className="detail-sub">{selectedRow.title}</p><div className="detail-grid"><div><span>Etapa</span><strong>{selectedRow.stage_name}</strong></div><div><span>Valor</span><strong>{new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(selectedRow.estimated_value || 0)}</strong></div><div><span>Responsável</span><strong>{selectedRow.owner_name}</strong></div><div><span>Próximo passo</span><strong>{selectedRow.next_action_type || "Definir ação"}</strong></div></div><div className="details-note">Ação registrada pela equipe e acompanhada no histórico do contato.</div></aside></div>}
  </div>;
}
