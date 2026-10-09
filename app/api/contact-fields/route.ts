import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";
import { consumeRateLimit } from "@/lib/rate-limit";
import { contactFieldTypes, fieldKeyFromLabel } from "@/lib/contact-fields";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

async function admin(companyId: string) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { supabase, user: null, allowed: false };
  const { data, error } = await supabase.from("memberships").select("role")
    .eq("company_id", companyId).eq("user_id", user.id).maybeSingle();
  if (error) throw error;
  return { supabase, user, allowed: !!data && ["owner", "admin"].includes(data.role) };
}

export async function POST(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) return fail("Origem não permitida.", 403);
  if (Number(request.headers.get("content-length") || 0) > 2048) return fail("Dados muito grandes.", 413);
  try {
    const body = await request.json();
    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    const label = typeof body.label === "string" ? body.label.trim() : "";
    const fieldType = body.fieldType;
    const fieldKey = fieldKeyFromLabel(label);
    if (!uuid.test(companyId) || label.length < 1 || label.length > 50 || !/^[a-z][a-z0-9_]{0,31}$/.test(fieldKey)
      || !contactFieldTypes.includes(fieldType)) return fail("Nome ou tipo de campo inválido.");
    const ctx = await admin(companyId);
    if (!ctx.user) return fail("Entre na sua conta.", 401);
    if (!ctx.allowed) return fail("Somente responsáveis pela empresa podem criar campos.", 403);
    const rate = consumeRateLimit(`contact-fields:${ctx.user.id}`, 25, 10 * 60 * 1000);
    if (!rate.allowed) return fail("Muitas alterações. Aguarde.", 429);
    const { data, error } = await ctx.supabase.from("contact_field_definitions")
      .insert({ company_id: companyId, field_key: fieldKey, label, field_type: fieldType })
      .select("id,field_key,label,field_type,active").single();
    if (error?.code === "23505") return fail("Já existe um campo com esse nome nesta empresa.", 409);
    if (error) throw error;
    return Response.json({ field: data });
  } catch (error) { console.error("contact-fields POST", error); return fail("Não foi possível criar o campo.", 500); }
}

export async function PATCH(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) return fail("Origem não permitida.", 403);
  if (Number(request.headers.get("content-length") || 0) > 1024) return fail("Dados muito grandes.", 413);
  try {
    const body = await request.json();
    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    const id = typeof body.id === "string" ? body.id : "";
    if (!uuid.test(companyId) || !uuid.test(id) || typeof body.active !== "boolean") return fail("Campo inválido.");
    const ctx = await admin(companyId);
    if (!ctx.user) return fail("Entre na sua conta.", 401);
    if (!ctx.allowed) return fail("Somente responsáveis pela empresa podem alterar campos.", 403);
    const rate = consumeRateLimit(`contact-fields:${ctx.user.id}`, 25, 10 * 60 * 1000);
    if (!rate.allowed) return fail("Muitas alterações. Aguarde.", 429);
    const { data, error } = await ctx.supabase.from("contact_field_definitions")
      .update({ active: body.active }).eq("company_id", companyId).eq("id", id)
      .select("id,field_key,label,field_type,active").maybeSingle();
    if (error) throw error;
    if (!data) return fail("Campo não encontrado.", 404);
    return Response.json({ field: data });
  } catch (error) { console.error("contact-fields PATCH", error); return fail("Não foi possível alterar o campo.", 500); }
}
