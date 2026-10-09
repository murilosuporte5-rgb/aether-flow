import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";
import { consumeRateLimit } from "@/lib/rate-limit";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function PUT(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN))
    return fail("Origem não permitida.", 403);
  if (Number(request.headers.get("content-length") || 0) > 1024) return fail("Dados muito grandes.", 413);
  let body: unknown;
  try { body = await request.json(); } catch { return fail("Dados inválidos."); }
  if (!body || typeof body !== "object" || Array.isArray(body)) return fail("Dados inválidos.");
  const { companyId, messagesEnabled } = body as Record<string, unknown>;
  if (typeof companyId !== "string" || !uuid.test(companyId) || typeof messagesEnabled !== "boolean")
    return fail("Empresa ou configuração inválida.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Entre na sua conta.", 401);
  const rate = consumeRateLimit(`company-modules:${user.id}`, 20, 10 * 60 * 1000);
  if (!rate.allowed) return Response.json({ error: "Muitas alterações. Aguarde." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
  const { data: membership, error: membershipError } = await supabase.from("memberships")
    .select("role").eq("company_id", companyId).eq("user_id", user.id).maybeSingle();
  if (membershipError) return fail("Não foi possível verificar seu acesso.", 500);
  if (!membership || !["owner", "admin"].includes(membership.role))
    return fail("Somente responsáveis pela empresa podem configurar módulos.", 403);
  const { data, error } = await supabase.from("company_modules")
    .upsert({ company_id: companyId, module_key: "messages", enabled: messagesEnabled, updated_at: new Date().toISOString() }, { onConflict: "company_id,module_key" })
    .select("enabled").single();
  if (error) { console.error("company-modules PUT", error); return fail("Não foi possível salvar o módulo.", 500); }
  return Response.json({ messagesEnabled: data.enabled });
}
