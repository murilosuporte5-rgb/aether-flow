import { ArrowRight, Check, FileSpreadsheet, GraduationCap, ShieldCheck, Users } from "lucide-react";
import { trialWhatsAppUrl } from "./landing-cta";

const planItems = [
  "Radar de retornos, compromissos e oportunidades paradas",
  "Contatos, pipeline, mensagens e histórico no mesmo fluxo",
  "Importação e exportação em CSV",
  "1 administrador + até 3 funcionários (4 pessoas) no ambiente da empresa",
  "Tutorial rápido para a primeira configuração",
];

export default function LandingCommercialSection() {
  return (
    <section className="landing-commercial" id="plano" aria-labelledby="plan-title">
      <div className="landing-commercial-intro">
        <span className="landing-eyebrow">COMECE COM A OPERAÇÃO COMPLETA</span>
        <h2 id="plan-title">Um acesso simples para organizar a equipe desde o primeiro contato.</h2>
        <p>
          Um plano simples para colocar o radar comercial e o fluxo de atendimento da empresa em um só lugar. Sem taxa de implantação e sem fidelidade.
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
          <span className="landing-plan-badge"><Users size={15} /> 4 pessoas</span>
        </div>
        <div className="landing-plan-price">
          <span className="landing-plan-trial">7 dias grátis para testar</span>
          <div className="landing-plan-amount"><span>R$</span><strong>67</strong><span>/mês</span></div>
          <p>por empresa · 1 administrador + até 3 funcionários (4 pessoas)</p>
          <p>Sem taxa de implantação · sem fidelidade · cancele quando quiser</p>
        </div>
        <div className="landing-plan-includes"><span>O que está incluído</span><ul>{planItems.map((item) => <li key={item}><Check size={16} /> {item}</li>)}</ul></div>
        <a className="landing-primary landing-plan-cta" href={trialWhatsAppUrl} target="_blank" rel="noreferrer">Pedir teste grátis por 7 dias <ArrowRight size={17} /></a>
        <small>Quer ver antes? <a href="/demo?view=panel#demo-screen">Conhecer a demonstração</a> · acesso já liberado? <a href="/login">Entrar no ambiente</a></small>
      </article>
    </section>
  );
}
