import { redirect } from "next/navigation";
import { Bell, ChevronLeft, ExternalLink, Settings, ShieldCheck, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { AetherMark } from "../aether-logo";

export const dynamic = "force-dynamic";

export default async function SettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  return (
    <main className="settings-screen">
      <header className="settings-header">
        <a className="settings-brand" href="/" aria-label="Voltar ao painel"><AetherMark size={34}/><span><strong>Aether Flow</strong><small>CONFIGURAÇÕES</small></span></a>
        <a className="settings-back" href="/"><ChevronLeft size={16}/> Voltar ao painel</a>
      </header>
      <section className="settings-content">
        <div className="settings-title"><span className="eyebrow">AMBIENTE DO CLIENTE</span><h1>Configurações</h1><p>Controle seu acesso, a conexão do WhatsApp e os avisos da operação em um só lugar.</p></div>
        <div className="settings-grid">
          <article className="settings-card"><div className="settings-card-icon"><ShieldCheck size={19}/></div><div><h2>Conta e acesso</h2><p>{user.email || "Seu e-mail de acesso"}</p><span className="settings-status">Sessão protegida</span></div></article>
          <a className="settings-card settings-card-link" href="/integracoes/whatsapp"><div className="settings-card-icon whatsapp-settings-icon"><Smartphone size={19}/></div><div><h2>WhatsApp Business</h2><p>Conecte, consulte o estado ou gere um novo QR Code.</p><span className="settings-link-label">Abrir conexão <ExternalLink size={13}/></span></div></a>
          <article className="settings-card"><div className="settings-card-icon"><Bell size={19}/></div><div><h2>Avisos da operação</h2><p>Alertas de retornos e oportunidades aparecem no painel principal.</p><span className="settings-status">Ativos no painel</span></div></article>
          <article className="settings-card"><div className="settings-card-icon"><Settings size={19}/></div><div><h2>Preferências</h2><p>Mais preferências poderão ser adicionadas conforme sua equipe crescer.</p><span className="settings-status muted">Configuração simples</span></div></article>
        </div>
      </section>
    </main>
  );
}
