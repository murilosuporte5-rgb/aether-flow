import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";
import { isCompanyModuleEnabled } from "@/lib/company-modules";
import { consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

async function access(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, allowed: false, enabled: false };
  const { data: membership, error } = await supabase.from("memberships")
    .select("company_id").eq("company_id", companyId).eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  const allowed = !!membership;
  return { supabase, user, allowed, enabled: allowed ? await isCompanyModuleEnabled(supabase, companyId, "messages") : false };
}

export async function GET(request: Request) {
  const companyId = new URL(request.url).searchParams.get("companyId") || "";
  if (!uuid.test(companyId)) return fail("Empresa inválida.");
  try {
    const ctx = await access(companyId);
    if (!ctx.user) return fail("Entre na sua conta.", 401);
    if (!ctx.allowed) return fail("Empresa não autorizada.", 403);
    if (!ctx.enabled) return fail("Módulo de mensagens desativado nesta empresa.", 403);
    const { data, error } = await ctx.supabase.from("message_templates")
      .select("id,name,body,created_at,updated_at").eq("company_id", companyId).order("created_at", { ascending: true });
    if (error) throw error;
    return Response.json({ items: data || [] });
  } catch (error) { console.error("message-templates GET", error); return fail("Não foi possível carregar as mensagens.", 500); }
}

export async function POST(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) return fail("Origem não permitida.", 403);
  if (Number(request.headers.get("content-length") || 0) > 3000) return fail("Dados muito grandes.", 413);
  try {
    const body = await request.json();
    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    const name = typeof body.name === "string" ? body.name.trim().slice(0, 80) : "";
    const message = typeof body.body === "string" ? body.body.trim().slice(0, 1000) : "";
    if (!uuid.test(companyId) || !name || !message) return fail("Nome e texto são obrigatórios.");
    const ctx = await access(companyId);
    if (!ctx.user) return fail("Entre na sua conta.", 401);
    if (!ctx.allowed) return fail("Empresa não autorizada.", 403);
    if (!ctx.enabled) return fail("Módulo de mensagens desativado nesta empresa.", 403);
    const rate = consumeRateLimit(`message-template:${ctx.user.id}`, 30, 10 * 60 * 1000);
    if (!rate.allowed) return fail("Muitas alterações. Aguarde.", 429);
    const { data, error } = await ctx.supabase.from("message_templates")
      .insert({ company_id: companyId, name, body: message, created_by: ctx.user.id })
      .select("id,name,body,created_at,updated_at").single();
    if (error) throw error;
    return Response.json({ item: data });
  } catch (error) { console.error("message-templates POST", error); return fail("Não foi possível salvar a mensagem.", 500); }
}

export async function DELETE(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) return fail("Origem não permitida.", 403);
  const url = new URL(request.url);
  const companyId = url.searchParams.get("companyId") || "", id = url.searchParams.get("id") || "";
  if (!uuid.test(companyId) || !uuid.test(id)) return fail("Mensagem inválida.");
  try {
    const ctx = await access(companyId);
    if (!ctx.user) return fail("Entre na sua conta.", 401);
    if (!ctx.allowed) return fail("Empresa não autorizada.", 403);
    if (!ctx.enabled) return fail("Módulo de mensagens desativado nesta empresa.", 403);
    const rate = consumeRateLimit(`message-template:${ctx.user.id}`, 30, 10 * 60 * 1000);
    if (!rate.allowed) return fail("Muitas alterações. Aguarde.", 429);
    const { error } = await ctx.supabase.from("message_templates").delete().eq("id", id).eq("company_id", companyId);
    if (error) throw error;
    return Response.json({ ok: true });
  } catch (error) { console.error("message-templates DELETE", error); return fail("Não foi possível excluir a mensagem.", 500); }
}
