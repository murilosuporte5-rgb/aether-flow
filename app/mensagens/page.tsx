import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { isCompanyModuleEnabled } from "@/lib/company-modules";
import MessagesClient from "./messages-client";

export const dynamic = "force-dynamic";

export default async function MessagesPage({ searchParams }: { searchParams: Promise<{ companyId?: string }> }) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/login");
  const { data: memberships, error } = await supabase.from("memberships")
    .select("company_id,companies(name,is_demo)").eq("user_id", user.id);
  if (error) throw error;
  const { companyId } = await searchParams;
  const realMemberships = (memberships || []).filter((item) => {
    const company = Array.isArray(item.companies) ? item.companies[0] : item.companies;
    return company && !company.is_demo;
  });
  const membership = realMemberships.find((item) => item.company_id === companyId) || realMemberships[0];
  if (!membership) return <main className="page-body"><h1>Nenhuma empresa disponível</h1><a href="/">Voltar ao painel</a></main>;
  const company = Array.isArray(membership.companies) ? membership.companies[0] : membership.companies;
  const enabled = await isCompanyModuleEnabled(supabase, membership.company_id, "messages");
  if (!enabled) return <main className="page-body"><h1>Mensagens prontas desativadas</h1><p>Este módulo foi desativado para {company?.name || "esta empresa"}. Os modelos existentes continuam guardados.</p><a href={`/configuracoes?companyId=${membership.company_id}`}>Abrir configurações</a></main>;
  return <MessagesClient companyId={membership.company_id} companyName={company?.name || "Empresa"} />;
}
