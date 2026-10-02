import Image from "next/image";
import {
  ArrowRight,
  BarChart3,
  Check,
  ChevronDown,
  CircleCheck,
  Bell,
  ClipboardList,
  Package,
  MessageCircle,
  ShieldCheck,
  Sparkles,
  Target,
  Users,
} from "lucide-react";
import LandingCommercialSection from "./landing-commercial-section";
import LandingFooter from "./landing-footer";
import LandingHeader from "./landing-header";
import LandingProductGallery from "./landing-product-gallery";
import LandingMobileProof from "./landing-mobile-proof";
import { trialWhatsAppUrl } from "./landing-cta";

const featureCards = [
  {
    icon: Target,
    tone: "blue",
    title: "Radar de atenção",
    text: "A fila mostra primeiro o retorno vencido, o compromisso de hoje e a oportunidade sem próximo passo.",
  },
  {
    icon: Sparkles,
    tone: "amber",
    title: "Modo rápido",
    text: "Registre uma oportunidade em poucos campos e siga para a próxima conversa sem perder ritmo.",
  },
  {
    icon: MessageCircle,
    tone: "green",
    title: "Mensagens prontas",
    text: "Escolha uma mensagem do seu banco e abra o WhatsApp com o contexto certo para cada contato.",
  },
  {
    icon: BarChart3,
    tone: "violet",
    title: "Métricas que explicam",
    text: "Ganhos, perdas, taxa de ganho e valor em aberto aparecem sem esconder o que precisa de decisão.",
  },
  {
    icon: Users,
    tone: "cyan",
    title: "Equipe com responsável",
    text: "Cada contato tem dono, histórico e permissão definida para o time trabalhar sem desencontro.",
  },
  {
    icon: ShieldCheck,
    tone: "slate",
    title: "Ambiente protegido",
    text: "Os dados ficam separados por empresa, com acesso individual e ações registradas no histórico.",
  },
  {
    icon: Package,
    tone: "blue",
    title: "Produtos e validade",
    text: "Acompanhe saldo, lote, validade e estoque mínimo junto da rotina comercial da empresa.",
  },
  {
    icon: Bell,
    tone: "amber",
    title: "Alertas de operação",
    text: "Receba sinais quando um item estiver baixo, próximo da validade ou precisar de reposição.",
  },
  {
    icon: ClipboardList,
    tone: "green",
    title: "Pedidos e avarias",
    text: "Registre pedidos de reposição e avarias com responsável, quantidade e histórico auditável.",
  },
];

const beforeAfter = [
  {
    before: "O cliente pede retorno e a informação fica espalhada.",
    after: "O radar aponta o próximo passo e quem deve agir.",
  },
  {
    before: "A equipe conversa, mas ninguém sabe quem ficou responsável.",
    after: "Cada contato tem responsável, prazo e histórico visível.",
  },
  {
    before: "O mês termina com sensação de movimento, sem saber o resultado.",
    after: "Ganhos, perdas e taxa de conversão mostram o que aconteceu.",
  },
];

const steps = [
  ["01", "Cadastre o contato", "Comece pelo nome, telefone e oportunidade. O Aether Flow reutiliza o contato quando ele voltar."],
  ["02", "Defina o próximo passo", "Agende uma ligação, uma proposta ou um follow-up com data e responsável."],
  ["03", "Aja no momento certo", "O radar organiza a fila, a mensagem abre no WhatsApp e o histórico registra o resultado."],
];

const nicheGroups = [
  {
    title: "Atendimento e serviços",
    items: [
      ["💈", "Salão e barbearia", "Orçamentos, retornos e horários sem cliente esquecido."],
      ["🛠️", "Oficina e serviços", "Cada orçamento com prazo, responsável e histórico."],
      ["🐶", "Pet shop", "Banho, tosa e retornos organizados numa fila simples."],
      ["🩺", "Clínicas e consultórios", "A equipe acompanha o próximo contato com clareza."],
    ],
  },
  {
    title: "Times que vendem",
    items: [
      ["🧠", "Consultorias", "Propostas, reuniões e decisões no mesmo fluxo."],
      ["🎯", "Times comerciais", "Gestores enxergam valor parado e quem deve agir."],
    ],
  },
] as const;

export default function LandingPage() {
  return (
    <main className="landing-page">
      <LandingHeader />

      <section className="landing-hero" id="topo">
        <div className="landing-hero-copy">
          <div className="landing-kicker"><span /> AETHER WORKS · OPERAÇÃO COMERCIAL</div>
          <h1>Saiba quem precisa de retorno antes que a venda esfrie.</h1>
          <p className="landing-lede">O Aether Flow organiza urgência, compromissos e oportunidades paradas em uma fila clara para sua equipe agir.</p>
          <div className="landing-actions">
            <a className="landing-primary" href={trialWhatsAppUrl} target="_blank" rel="noreferrer">Teste grátis por 7 dias <ArrowRight size={17} /></a>
            <a className="landing-secondary" href="#produto">Ver telas reais</a>
          </div>
          <div className="landing-proof"><CircleCheck size={17} /> Sem planilha perdida <span /> <ShieldCheck size={17} /> Dados separados por empresa</div>
        </div>

        <div className="landing-hero-product" aria-label="Captura real do painel Aether Flow">
          <div className="landing-static-frame">
            <div className="landing-live-frame-head"><span><i className="live-dot" /> AETHER FLOW · CAPTURA REAL DO PAINEL</span><small>Dados fictícios para demonstração</small></div>
            <Image src="/demo/panel.png" alt="Painel real do Aether Flow com alertas e oportunidades fictícias" width={1440} height={980} sizes="(max-width: 700px) 100vw, 58vw" priority />
          </div>
        </div>
      </section>

      <section className="landing-stat-strip" aria-label="Resultados acompanhados pelo Aether Flow">
        <div><strong>1 fila</strong><span>para o que precisa de atenção</span></div><div><strong>1 responsável</strong><span>para cada contato e oportunidade</span></div><div><strong>1 histórico</strong><span>para entender o que aconteceu</span></div><div><strong>CSV pronto</strong><span>para trazer e levar sua base</span></div>
      </section>

      <section className="landing-section landing-before-after" id="como-funciona">
        <div className="landing-section-heading"><span className="landing-eyebrow">O ANTES E O DEPOIS</span><h2>O que fica espalhado na cabeça vira uma próxima ação clara.</h2><p>A equipe não precisa adivinhar qual conversa vem primeiro. O sistema transforma o movimento comercial em uma fila que dá para acompanhar.</p></div>
        <div className="before-after-list">{beforeAfter.map((item) => <div className="before-after-row" key={item.before}><div className="before"><span>✕ &nbsp; ANTES</span><p>{item.before}</p></div><ArrowRight size={19} /><div className="after"><span>✓ &nbsp; DEPOIS</span><p>{item.after}</p></div></div>)}</div>
      </section>

      <section className="landing-section landing-how" aria-labelledby="how-title">
        <div className="landing-section-heading"><span className="landing-eyebrow">COMO FUNCIONA</span><h2 id="how-title">É simples assim: 1, 2, 3.</h2><p>Do primeiro cadastro ao próximo retorno, sem transformar a operação em mais uma tarefa.</p></div>
        <div className="landing-step-grid">{steps.map(([number, title, text]) => <article key={number}><span className="step-number">{number}</span><h3>{title}</h3><p>{text}</p></article>)}</div>
      </section>

      <section className="landing-section landing-audience" id="para-quem">
        <div className="landing-section-heading"><span className="landing-eyebrow">PARA QUEM É</span><h2>Serve para a sua empresa. Seja qual for o ramo.</h2><p>Cada equipe perde uma oportunidade de um jeito. O Aether Flow deixa o próximo passo visível para todos.</p></div>
        <div className="landing-niche-groups">{nicheGroups.map((group) => <section className="landing-niche-group" key={group.title}><h3>{group.title}</h3><div className="landing-audience-grid">{group.items.map(([emoji, title, text], index) => <article key={title}><span>{emoji} <small>{String(index + 1).padStart(2, "0")}</small></span><h4>{title}</h4><p>{text}</p></article>)}</div></section>)}</div>
      </section>

      <section className="landing-product-section" id="produto">
        <div className="landing-section-heading light"><span className="landing-eyebrow">O SISTEMA POR DENTRO</span><h2>Não é maquete. É a operação rodando.</h2><p>Veja como o radar transforma cada conversa em uma ação que alguém consegue concluir.</p></div>
        <LandingProductGallery />
      </section>

      <LandingMobileProof />

      <section className="landing-section" id="recursos">
        <div className="landing-section-heading"><span className="landing-eyebrow">RECURSOS PARA VENDER MELHOR</span><h2>Menos cliques para agir. Mais clareza para decidir.</h2><p>As ferramentas aparecem juntas porque fazem parte do mesmo fluxo comercial.</p></div>
        <div className="landing-feature-grid">{featureCards.map(({icon: Icon, tone, title, text}) => <article key={title} className={`landing-feature-card ${tone}`}><span className="feature-icon"><Icon size={20} /></span><h3>{title}</h3><p>{text}</p><span className="feature-check"><Check size={14} /> pronto para usar</span></article>)}</div>
      </section>

      <section className="landing-team-section" id="equipe">
        <div className="landing-team-copy"><span className="landing-eyebrow">EQUIPE SEM DESENCONTRO</span><h2>Todo contato tem um dono. Todo dono sabe o que fazer.</h2><p>O administrador adiciona funcionários, define a função e acompanha quem ficou responsável por cada atendimento. Assim a conversa não some entre várias pessoas.</p><a className="landing-secondary light-button" href="/login">Ver o ambiente <ArrowRight size={16} /></a></div>
        <div className="landing-team-card"><div className="team-card-head"><span>RESPONSÁVEIS</span><b>3 de 3 vagas usadas</b></div><div className="team-person"><span className="team-avatar blue-avatar">M</span><div><strong>Marina Alves</strong><small>Administrador · 4 oportunidades</small></div><span className="team-pill owner-pill">Admin</span></div><div className="team-person"><span className="team-avatar green-avatar">J</span><div><strong>João Oliveira</strong><small>Responsável · 2 oportunidades</small></div><span className="team-pill">Em dia</span></div><div className="team-person"><span className="team-avatar amber-avatar">A</span><div><strong>Ana Costa</strong><small>Responsável · 1 oportunidade</small></div><span className="team-pill">1 ação hoje</span></div><div className="team-owner-note"><ShieldCheck size={15} /> O administrador controla acessos e mantém cada empresa isolada.</div></div>
      </section>

      <LandingCommercialSection />

      <section className="landing-section landing-faq" id="duvidas">
        <div className="landing-section-heading"><span className="landing-eyebrow">DÚVIDAS</span><h2>O que você costuma querer saber antes de começar.</h2></div>
        <div className="landing-faq-list"><details><summary>Minha equipe vai conseguir usar? <ChevronDown size={17} /></summary><p>Sim. O fluxo começa com poucos campos, mostra o próximo passo e permite abrir uma mensagem pronta sem procurar em outra ferramenta.</p></details><details><summary>O que acontece quando eu entro pela primeira vez? <ChevronDown size={17} /></summary><p>Você configura o ambiente da empresa, cadastra a primeira oportunidade e pode seguir pelo tutorial rápido dentro do painel.</p></details><details><summary>Consigo trazer os dados que já tenho? <ChevronDown size={17} /></summary><p>Sim. O Aether Flow importa oportunidades por CSV e exporta contatos e oportunidades para você manter a portabilidade da operação.</p></details><details><summary>Os dados de outras empresas aparecem para mim? <ChevronDown size={17} /></summary><p>Não. Cada usuário acessa apenas as empresas das quais participa, com permissões definidas pelo administrador.</p></details><details><summary>Quanto custa o acesso? <ChevronDown size={17} /></summary><p>R$ 67 por mês por empresa, com até três integrantes no plano atual. Cancele quando quiser, sem taxa de implantação e sem fidelidade.</p></details></div>
      </section>

      <section className="landing-final-cta"><div><span className="landing-eyebrow">PRÓXIMO PASSO</span><h2>Teste o Aether Flow por 7 dias.</h2><p>Fale com a Aether Works e receba o acesso para experimentar a operação com sua equipe.</p></div><div className="landing-actions"><a className="landing-primary" href={trialWhatsAppUrl} target="_blank" rel="noreferrer">Teste grátis por 7 dias <ArrowRight size={17} /></a><a className="landing-secondary" href="#produto">Ver telas reais</a></div></section>

      <LandingFooter />
    </main>
  );
}
