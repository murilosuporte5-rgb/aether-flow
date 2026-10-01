import { createClient } from "@/lib/supabase/server";
import { isRequestOriginAllowed } from "@/lib/request-origin";

export const dynamic = "force-dynamic";
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const fail = (error: string, status = 400) => Response.json({ error }, { status });

export async function POST(request: Request) {
  if (!isRequestOriginAllowed(request.headers.get("origin"), request.url, process.env.RAILWAY_PUBLIC_DOMAIN)) {
    return fail("Origem não permitida.", 403);
  }
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return fail("Entre na sua conta para continuar.", 401);
  const apiKey = process.env.RESEND_API_KEY?.trim();
  const from = process.env.RESEND_FROM_EMAIL?.trim();
  if (!apiKey || !from) return fail("O envio de e-mail ainda não foi configurado pelo administrador.", 503);
  try {
    const raw = await request.text();
    if (raw.length > 18_000) return fail("A mensagem excede o limite.", 413);
    const body = JSON.parse(raw);
    const companyId = typeof body.companyId === "string" ? body.companyId : "";
    const contactId = typeof body.contactId === "string" ? body.contactId : "";
    const subject = typeof body.subject === "string" ? body.subject.trim().slice(0, 160) : "";
    const text = typeof body.text === "string" ? body.text.trim().slice(0, 10_000) : "";
    if (!/^[0-9a-f-]{36}$/i.test(companyId) || !/^[0-9a-f-]{36}$/i.test(contactId) || !subject || !text) {
      return fail("Assunto e mensagem são obrigatórios.");
    }
    const { data: membership } = await supabase
      .from("memberships")
      .select("company_id")
      .eq("company_id", companyId)
      .eq("user_id", user.id)
      .maybeSingle();
    if (!membership) return fail("Empresa não autorizada.", 403);
    const { data: contact, error: contactError } = await supabase
      .from("contacts")
      .select("id,name,email")
      .eq("company_id", companyId)
      .eq("id", contactId)
      .maybeSingle();
    if (contactError || !contact) return fail("Contato não encontrado nesta empresa.", 404);
    if (typeof contact.email !== "string" || !EMAIL.test(contact.email)) {
      return fail("Cadastre um e-mail válido para este contato.", 422);
    }
    const response = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        from,
        to: [contact.email],
        subject,
        text,
        ...(process.env.RESEND_REPLY_TO?.trim() ? { reply_to: process.env.RESEND_REPLY_TO.trim() } : {}),
      }),
    });
    if (!response.ok) return fail("O provedor de e-mail recusou o envio. Tente novamente.", 502);
    const result = await response.json().catch(() => ({}));
    return Response.json({ ok: true, id: typeof result?.id === "string" ? result.id : null });
  } catch {
    return fail("Não foi possível enviar o e-mail agora.", 502);
  }
}
