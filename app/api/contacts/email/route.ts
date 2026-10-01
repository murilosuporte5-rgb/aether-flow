import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";

export const dynamic = "force-dynamic";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function PATCH(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) {
    return fail("Origem não permitida.", 403);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Entre na sua conta para continuar.", 401);
  try {
    const body = await request.json();
    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    const contactId = typeof body.contactId === "string" ? body.contactId : "";
    const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
    if (!/^[0-9a-f-]{36}$/i.test(companyId) || !/^[0-9a-f-]{36}$/i.test(contactId) || !EMAIL.test(email)) {
      return fail("Informe um e-mail válido.");
    }
    const { data: membership } = await supabase
      .from("memberships")
      .select("company_id")
      .eq("company_id", companyId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) return fail("Empresa não autorizada.", 403);
    const { data, error } = await supabase
      .from("contacts")
      .update({ email })
      .eq("company_id", companyId)
      .eq("id", contactId)
      .select("id,email")
      .maybeSingle();
    if (error || !data) return fail("Não foi possível salvar o e-mail.", error ? 500 : 404);
    return Response.json({ contact: data });
  } catch {
    return fail("Dados inválidos.");
  }
}
