import { redirect } from "next/navigation";
import { Bell, ChevronLeft, ExternalLink, ShieldCheck, Smartphone } from "lucide-react";
import { createClient } from "@/lib/supabase/server";
import { brandColorOrDefault } from "@/lib/company-branding";
import { AetherMark } from "../aether-logo";
import BrandingForm from "./branding-form";
import ModulesForm from "./modules-form";

export const dynamic = "force-dynamic";

export default async function SettingsPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships, error: membershipError } = await supabase.from("memberships")
    .select("company_id,role,companies(name,is_demo)").eq("user_id", user.id);
  if (membershipError) throw membershipError;
  const { companyId } = await searchParams;
  const realMemberships = memberships?.filter((item) => {
    const company = Array.isArray(item.companies) ? item.companies[0] : item.companies;
    return company && !company.is_demo;
  }) || [];
  const membership = realMemberships.find((item) => item.company_id === companyId) || realMemberships[0];
  const company = membership && (Array.isArray(membership.companies) ? membership.companies[0] : membership.companies);
  let accentColor = brandColorOrDefault(null);
  let messagesEnabled = true;
  if (membership) {
    const [branding, module] = await Promise.all([
      supabase.from("company_branding").select("accent_color").eq("company_id", membership.company_id).maybeSingle(),
      supabase.from("company_modules").select("enabled").eq("company_id", membership.company_id).eq("module_key", "messages").maybeSingle(),
    ]);
    if (branding.error) throw branding.error;
    if (module.error) throw module.error;
    accentColor = brandColorOrDefault(branding.data?.accent_color);
    messagesEnabled = module.data?.enabled ?? true;
  }
  return (
    <main className="settings-screen">
      <header className="settings-header">
        <a className="settings-brand" href="/" aria-label="Voltar ao painel"><AetherMark size={34}/><span><strong>Aether Flow</strong><small>CONFIGURAÇÕES</small></span></a>
        <a className="settings-back" href="/"><ChevronLeft size={16}/> Voltar ao painel</a>
      </header>
      <section className="settings-content">
        <div className="settings-title"><span className="eyebrow">AMBIENTE DO CLIENTE</span><h1>Configurações</h1><p>Controle seu acesso, a conexão do WhatsApp e os avisos da operação em um só lugar.</p></div>
        {realMemberships.length > 1 && <nav className="settings-company-nav" aria-label="Selecionar empresa">
          {realMemberships.map((item) => {
            const itemCompany = Array.isArray(item.companies) ? item.companies[0] : item.companies;
            return <a key={item.company_id} href={`/configuracoes?companyId=${encodeURIComponent(item.company_id)}`} aria-current={item.company_id === membership?.company_id ? "page" : undefined}>{itemCompany?.name || "Empresa"}</a>;
          })}
        </nav>}
        <div className="settings-grid">
          <article className="settings-card"><div className="settings-card-icon"><ShieldCheck size={19}/></div><div><h2>Conta e acesso</h2><p>{user.email || "Seu e-mail de acesso"}</p><span className="settings-status">Sessão protegida</span></div></article>
          <a className="settings-card settings-card-link" href="/integracoes/whatsapp"><div className="settings-card-icon whatsapp-settings-icon"><Smartphone size={19}/></div><div><h2>WhatsApp Business</h2><p>Conecte, consulte o estado ou gere um novo QR Code.</p><span className="settings-link-label">Abrir conexão <ExternalLink size={13}/></span></div></a>
          <article className="settings-card"><div className="settings-card-icon"><Bell size={19}/></div><div><h2>Avisos da operação</h2><p>Alertas de retornos e oportunidades aparecem no painel principal.</p><span className="settings-status">Ativos no painel</span></div></article>
          {membership && company && <BrandingForm companyId={membership.company_id} companyName={company.name} initialColor={accentColor} canEdit={["owner", "admin"].includes(membership.role)} />}
          {membership && company && <ModulesForm companyId={membership.company_id} initialEnabled={messagesEnabled} canEdit={["owner", "admin"].includes(membership.role)} />}
        </div>
      </section>
    </main>
  );
}
