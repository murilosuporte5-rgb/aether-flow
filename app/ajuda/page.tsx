import { redirect } from "next/navigation";
import { ArrowRight, BookOpen, ChevronLeft } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const guides = [
  {
    title: "Cadastrar a primeira oportunidade",
    steps: ["Abra Hoje e use Nova oportunidade.", "Informe o contato, o assunto e a etapa inicial.", "Defina a próxima ação para que o retorno entre no radar."],
    href: "/",
    action: "Abrir painel",
  },
  {
    title: "Acompanhar o funil",
    steps: ["Abra Pipeline no menu lateral.", "Mova a oportunidade para a etapa correta.", "Abra o registro para conferir o histórico e o próximo passo."],
    href: "/?view=pipeline",
    action: "Abrir pipeline",
  },
  {
    title: "Trazer ou exportar dados",
    steps: ["No painel, abra Métricas e CSV no menu lateral.", "Use o arquivo de exemplo para conferir as colunas aceitas.", "Revise o resultado da importação antes de seguir com o atendimento."],
    href: "/",
    action: "Abrir painel",
  },
  {
    title: "Personalizar a empresa",
    steps: ["Abra Configurações e selecione a empresa, se você participa de mais de uma.", "Escolha uma cor de destaque e salve.", "Volte ao painel para ver a identidade visual aplicada."],
    href: "/configuracoes",
    action: "Abrir configurações",
  },
];

export default async function HelpPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return <main className="help-screen">
    <div className="help-content">
      <a className="help-back" href="/"><ChevronLeft size={16} /> Voltar ao painel</a>
      <header><span className="eyebrow">CENTRAL DE AJUDA</span><h1>Aprenda a usar o Aether Flow</h1><p>Passos curtos para executar tarefas no aplicativo. O tutorial interativo também está disponível no painel.</p></header>
      <div className="help-grid">{guides.map((guide, index) => <article key={guide.title} className="help-card">
        <div className="help-card-heading"><span><BookOpen size={18} /></span><div><small>GUIA {index + 1}</small><h2>{guide.title}</h2></div></div>
        <ol>{guide.steps.map((step) => <li key={step}>{step}</li>)}</ol>
        <a href={guide.href}>{guide.action} <ArrowRight size={15} /></a>
      </article>)}</div>
    </div>
  </main>;
}
