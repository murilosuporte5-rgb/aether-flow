import { ArrowRight, Check, FileSpreadsheet, GraduationCap, ShieldCheck, Users } from "lucide-react";

const planItems = [
  "Radar de retornos, compromissos e oportunidades paradas",
  "Contatos, pipeline, mensagens e histórico no mesmo fluxo",
  "Importação e exportação em CSV",
  "Produtos, categorias, lotes, validade e histórico de movimentações sem limite de registros",
  "Até 3 integrantes no ambiente da empresa, com responsável por atendimento",
  "Tutorial rápido para a primeira configuração",
];

export default function LandingCommercialSection() {
  return (
    <section className="landing-commercial" id="plano" aria-labelledby="plan-title">
      <div className="landing-commercial-intro">
        <span className="landing-eyebrow">COMECE COM A OPERAÇÃO COMPLETA</span>
        <h2 id="plan-title">Um acesso simples para organizar a equipe desde o primeiro contato.</h2>
        <p>
          Um plano simples para colocar o radar comercial e a operação da empresa em um só lugar. Sem taxa de implantação e sem fidelidade.
        </p>
        <div className="landing-commercial-signals" aria-label="O que facilita a implantação">
          <span><FileSpreadsheet size={17} /> Traga sua base por CSV</span>
          <span><GraduationCap size={17} /> Aprenda pelo tutorial guiado</span>
          <span><ShieldCheck size={17} /> Mantenha cada empresa separada</span>
        </div>
      </div>

      <article className="landing-plan-card">
        <div className="landing-plan-head">
          <div><span>PLANO AETHER FLOW</span><h3>Acesso Aether Flow</h3></div>
          <span className="landing-plan-badge"><Users size={15} /> até 3 pessoas</span>
        </div>
        <p className="landing-plan-price"><strong>R$ 67 <small>/mês</small></strong><span>por empresa · cancele quando quiser, sem multa</span></p>
        <ul>{planItems.map((item) => <li key={item}><Check size={16} /> {item}</li>)}</ul>
        <a className="landing-primary landing-plan-cta" href="#produto">Ver telas reais <ArrowRight size={17} /></a>
        <small>Garantia de 7 dias · acesso já liberado? <a href="/login">Entrar no ambiente</a></small>
      </article>
    </section>
  );
}
