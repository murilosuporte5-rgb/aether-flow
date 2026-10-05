import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export const dynamic = "force-dynamic";

const fail = (error: string, status = 400) => NextResponse.json({ error }, { status });
const text = (value: unknown, max = 500) => typeof value === "string" ? value.trim().slice(0, max) : "";

async function context() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data: memberships, error } = await supabase.from("memberships").select("company_id").eq("user_id", user.id);
  if (error) throw error;
  return { supabase, user, companyIds: (memberships || []).map((item) => item.company_id) };
}

export async function GET() {
  try {
    const ctx = await context();
    if (!ctx) return fail("Entre na sua conta para continuar.", 401);
    if (!ctx.companyIds.length) return NextResponse.json({ captures: [] });
    const { data, error } = await ctx.supabase
      .from("whatsapp_captures")
      .select("id,company_id,name,phone,conversation,source,status,created_at")
      .in("company_id", ctx.companyIds)
      .eq("status", "pending")
      .order("created_at", { ascending: true })
      .limit(100);
    if (error) throw error;
    return NextResponse.json({ captures: data || [] });
  } catch (error) {
    console.error("whatsapp captures GET", error);
    return fail("Não foi possível carregar as capturas.", 500);
  }
}

export async function PATCH(request: Request) {
  try {
    const ctx = await context();
    if (!ctx) return fail("Entre na sua conta para continuar.", 401);
    const body = await request.json() as Record<string, unknown>;
    const id = text(body.id, 80);
    const decision = body.decision === "lead" || body.decision === "not_lead" ? body.decision : "";
    if (!id || !decision) return fail("Informe a captura e a decisão.");
    const { data: reviewed, error: reviewError } = await ctx.supabase.rpc("review_whatsapp_capture", { p_capture_id: id, p_request_id: crypto.randomUUID(), p_decision: decision });
    if (reviewError) {
      console.error("whatsapp capture review", { code: reviewError.code });
      if (reviewError.code === "P0001") return fail(reviewError.message, 409);
      if (reviewError.code === "42501") return fail("Empresa ou captura não autorizada.", 403);
      return fail("Não foi possível registrar essa decisão.", 500);
    }
    if (!reviewed?.ok) return fail("Essa captura já foi revisada ou não está disponível.", 404);
    return NextResponse.json(reviewed);
  } catch (error) {
    console.error("whatsapp captures PATCH", error);
    return fail("Não foi possível registrar essa decisão.", 500);
  }
}
