"use client";

import { useState } from "react";
import { AlertTriangle, ArrowDownToLine, ArrowUpFromLine, Boxes, FileBarChart, Filter, Package, RefreshCw, Search, Truck, X } from "lucide-react";

const sections = [
  { label: "Produtos", icon: Package, count: "14" },
  { label: "Categorias", icon: Boxes, count: "6" },
  { label: "Fornecedores", icon: Truck, count: "4" },
  { label: "Entradas", icon: ArrowDownToLine, count: "172" },
  { label: "Saídas", icon: ArrowUpFromLine, count: "20" },
  { label: "Relatórios", icon: FileBarChart, count: "3" },
];

const products = [
  ["Plano acompanhamento", "Serviços", "Ativo", "R$ 311,00", "Marina Alves"],
  ["Consultoria comercial", "Serviços", "Ativo", "R$ 480,00", "João Oliveira"],
  ["Pacote retorno mensal", "Recorrência", "Atenção", "R$ 199,00", "Ana Costa"],
];

export default function Operations({ userName }: { userName: string }) {
  const [active, setActive] = useState("Produtos");
  const [query, setQuery] = useState("");
  const [notice, setNotice] = useState("");
  const shown = products.filter((row) => row.join(" ").toLowerCase().includes(query.toLowerCase()));
  const flash = (message: string) => { setNotice(message); window.setTimeout(() => setNotice(""), 2400); };

  return <main className="page-body operations-page">
    <div className="heading"><div><span className="eyebrow">OPERAÇÃO</span><h1>Catálogo e movimentações</h1><p>Uma visão operacional conectada ao CRM: itens, entradas, saídas e alertas no mesmo lugar.</p></div><button className="primary" onClick={() => flash("Dados atualizados agora") }><RefreshCw size={16} /> Atualizar dados</button></div>
    {notice && <p className="operations-notice" role="status">✓ {notice}</p>}
    <div className="operations-layout">
      <aside className="operations-sidebar" aria-label="Seções da operação"><div className="operations-sidebar-title"><Boxes size={16}/> OPERAÇÃO</div>{sections.map(({ label, icon: Icon, count }) => <button type="button" key={label} className={active === label ? "active" : ""} onClick={() => setActive(label)}><Icon size={16}/><span>{label}</span><small>{count}</small></button>)}<div className="operations-sidebar-note"><AlertTriangle size={15}/><span>1 item pede atenção</span></div></aside>
      <section className="operations-main"><div className="operations-kpis"><article><span>Itens ativos</span><strong>14</strong><small>+2 nesta semana</small></article><article><span>Entradas no período</span><strong>172</strong><small>Últimos 30 dias</small></article><article><span>Saídas no período</span><strong>20</strong><small>5 aguardam retorno</small></article><article className="attention"><span>Alertas de atenção</span><strong>1</strong><small>Revisar hoje</small></article></div><div className="operations-toolbar"><label><Search size={15}/><span className="sr-only">Buscar item</span><input value={query} onChange={e => setQuery(e.target.value)} placeholder="Buscar produto, categoria ou responsável..." /></label><button className="secondary" type="button" onClick={() => flash("Filtros prontos para sua próxima ação")}><Filter size={15}/> Filtros</button></div><div className="operations-section-heading"><div><span className="eyebrow">{active.toUpperCase()}</span><h2>{active === "Produtos" ? "Itens que sua equipe acompanha" : `${active} da empresa`}</h2></div><span className="operations-context">Atualizado há poucos segundos</span></div>{active === "Produtos" ? <div className="operations-table-wrap"><table><thead><tr><th>Item</th><th>Categoria</th><th>Status</th><th>Valor</th><th>Responsável</th></tr></thead><tbody>{shown.map(row => <tr key={row[0]}><td><strong>{row[0]}</strong><small>Próximo passo registrado</small></td><td>{row[1]}</td><td><span className={`operations-status ${row[2] === "Atenção" ? "warn" : "ok"}`}>{row[2]}</span></td><td>{row[3]}</td><td>{row[4]}</td></tr>)}</tbody></table>{!shown.length && <p className="empty-table">Nenhum item encontrado.</p>}</div> : <div className="operations-empty"><Boxes size={28}/><h3>{active} prontos para integrar</h3><p>A estrutura visual está preparada para receber os registros da operação sem perder o histórico de contatos e oportunidades.</p><button className="secondary" type="button" onClick={() => setActive("Produtos")}><X size={14}/> Voltar para produtos</button></div>}</section>
    </div>
  </main>;
}
