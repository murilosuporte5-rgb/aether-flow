import {redirect} from 'next/navigation';
import {CalendarDays,Clock3,Target,Workflow} from 'lucide-react';

export const dynamic='force-dynamic';

const opportunities=[
 {name:'Mariana Souza',title:'Proposta comercial',stage:'Proposta',owner:'Murilo',next:'Hoje · 14:30',value:'R$ 4.800',state:'Hoje'},
 {name:'Empresa Horizonte',title:'Projeto sob medida',stage:'Negociação',owner:'Murilo',next:'Vencido · ontem',value:'R$ 8.200',state:'Vencido'},
 {name:'Carlos Almeida',title:'Pedido de orçamento',stage:'Em análise',owner:'Murilo',next:'Amanhã · 10:00',value:'R$ 2.900',state:'Programado'},
 {name:'Grupo Aurora',title:'Revisão de proposta',stage:'Aguardando decisão',owner:'Murilo',next:'Sem próxima ação',value:'R$ 6.500',state:'Sem próxima ação'},
 {name:'Fernanda Lima',title:'Consulta inicial',stage:'Novo',owner:'Murilo',next:'03/10 · 09:00',value:'R$ 1.700',state:'Programado'},
];

export default async function DemoPage({searchParams}:{searchParams:Promise<{access?:string}>}){
 const params=await searchParams;
 if(!process.env.DEMO_ACCESS_KEY||params.access!==process.env.DEMO_ACCESS_KEY)redirect('/login');
 return <div className="app">
  <aside className="sidebar">
   <div className="brand"><span className="brand-mark">A</span><div><strong>Aether Works</strong><small>DEMONSTRAÇÃO</small></div></div>
   <div className="workspace-label">MODO DEMONSTRAÇÃO</div>
   <nav><button className="active"><CalendarDays size={18}/> Hoje</button><button>Oportunidades</button><button>Pipeline</button></nav>
   <div className="sidebar-bottom"><div className="demo-note"><span className="demo-dot"/> SOMENTE LEITURA<p>Ambiente fictício para conhecer o fluxo sem alterar dados reais.</p></div></div>
  </aside>
  <main className="content">
   <header className="topbar"><div className="crumb">Empresa Demonstração <span>/</span> Geral</div><div className="topright"><span className="demo-pill">DEMONSTRAÇÃO</span></div></header>
   <div className="page-body">
    <div className="heading"><div><div className="eyebrow">CENTRAL DE AÇÕES · SOMENTE LEITURA</div><h1>O que precisa de atenção hoje</h1><p>Veja como a operação prioriza retornos, propostas e próximos passos.</p></div></div>
    <div className="signal-grid">
     <div className="signal-card danger"><span className="signal-icon"><Clock3 size={18}/></span><span className="signal-label">Retornos vencidos</span><strong>1</strong><small>Precisam de atenção</small></div>
     <div className="signal-card blue"><span className="signal-icon"><CalendarDays size={18}/></span><span className="signal-label">Ações para hoje</span><strong>1</strong><small>Compromissos do dia</small></div>
     <div className="signal-card amber"><span className="signal-icon"><Target size={18}/></span><span className="signal-label">Sem próximo passo</span><strong>1</strong><small>Acompanhamento indefinido</small></div>
     <div className="signal-card neutral"><span className="signal-icon"><Workflow size={18}/></span><span className="signal-label">Aguardando decisão</span><strong>1</strong><small>Em proposta ou negociação</small></div>
    </div>
    <section className="priority-panel">
     <div className="panel-heading"><div><span className="eyebrow">EXEMPLO DE OPERAÇÃO</span><h3>Oportunidades em acompanhamento</h3></div></div>
     <div className="table-wrap"><table><thead><tr><th>Cliente / oportunidade</th><th>Valor</th><th>Estágio</th><th>Responsável</th><th>Próxima ação</th><th>Status</th></tr></thead><tbody>
      {opportunities.map(o=><tr key={o.name}><td><strong>{o.name}</strong><small>{o.title}</small></td><td>{o.value}</td><td>{o.stage}</td><td>{o.owner}</td><td>{o.next}</td><td><span className={`state ${o.state==='Vencido'?'late':o.state==='Hoje'?'today':''}`}>{o.state}</span></td></tr>)}
     </tbody></table></div>
    </section>
    <p className="panel-footnote">Esta visualização usa apenas dados fictícios e não permite criar, editar, excluir ou enviar mensagens.</p>
   </div>
  </main>
 </div>;
}
