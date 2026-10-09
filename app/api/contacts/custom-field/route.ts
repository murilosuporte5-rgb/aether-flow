import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";
import { consumeRateLimit } from "@/lib/rate-limit";
import { contactFieldTypes, validContactFieldValue, type ContactFieldType } from "@/lib/contact-fields";

export const dynamic = "force-dynamic";
const uuid = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function PATCH(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) return fail("Origem não permitida.", 403);
  if (Number(request.headers.get("content-length") || 0) > 2048) return fail("Dados muito grandes.", 413);
  let body: Record<string, unknown>;
  try { body = await request.json(); } catch { return fail("Dados inválidos."); }
  const companyId = typeof body.companyId === "string" ? body.companyId : "";
  const contactId = typeof body.contactId === "string" ? body.contactId : "";
  const fieldKey = typeof body.fieldKey === "string" ? body.fieldKey : "";
  if (!uuid.test(companyId) || !uuid.test(contactId) || !/^[a-z][a-z0-9_]{0,31}$/.test(fieldKey)) return fail("Campo ou contato inválido.");

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Entre na sua conta.", 401);
  const { data: membership, error: membershipError } = await supabase.from("memberships")
    .select("company_id").eq("company_id", companyId).eq("user_id", user.id).maybeSingle();
  if (membershipError) return fail("Não foi possível verificar seu acesso.", 500);
  if (!membership) return fail("Empresa não autorizada.", 403);
  const rate = consumeRateLimit(`contact-field-value:${user.id}`, 40, 10 * 60 * 1000);
  if (!rate.allowed) return fail("Muitas alterações. Aguarde.", 429);
  const { data: field, error: fieldError } = await supabase.from("contact_field_definitions")
    .select("field_type,active").eq("company_id", companyId).eq("field_key", fieldKey).maybeSingle();
  if (fieldError) return fail("Não foi possível verificar o campo.", 500);
  if (!field?.active || !contactFieldTypes.includes(field.field_type as ContactFieldType)) return fail("Campo não disponível.", 404);
  const value = body.value;
  if (value !== null && !validContactFieldValue(field.field_type as ContactFieldType, value)) return fail("Valor inválido para este campo.");
  const { data, error } = await supabase.rpc("set_contact_custom_field", {
    p_company_id: companyId, p_contact_id: contactId, p_field_key: fieldKey, p_value: value,
  });
  if (error) {
    if (error.code === "42501") return fail("Alteração não permitida.", 403);
    console.error("contact custom field PATCH", error);
    return fail("Não foi possível salvar o campo.", 500);
  }
  return Response.json({ customData: data });
}
