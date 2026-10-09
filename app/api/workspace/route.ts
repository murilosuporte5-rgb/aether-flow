import { createClient } from "@/lib/supabase/server";
import { templates, type TemplateKey } from "@/lib/templates";
import { seedDemo } from "@/lib/provision";
import { isRequestOriginAllowed } from "@/lib/request-origin";
import { consumeRateLimit } from "@/lib/rate-limit";
import type { SupabaseClient } from "@supabase/supabase-js";
import { brandColorOrDefault } from "@/lib/company-branding";
import { isCompanyModuleEnabled } from "@/lib/company-modules";
export const dynamic = "force-dynamic";
const fail = (error: string, status = 400) =>
  Response.json({ error }, { status });
const txt = (value: unknown, max = 160) =>
  typeof value === "string" ? value.trim().slice(0, max) : "";
const templateKey = (v: unknown): TemplateKey =>
  typeof v === "string" && Object.hasOwn(templates, v)
    ? (v as TemplateKey)
    : "events";
async function access(
  s: SupabaseClient,
  userId: string,
  requestedCompany?: unknown,
  requestedTemplate?: unknown,
) {
  const { data, error } = await s
    .from("memberships")
    .select(
      "company_id,role,companies(id,name,company_template,is_demo,pipeline_version)",
    )
    .eq("user_id", userId);
  if (error) throw error;
  const companies = (data || []).flatMap((m) => {
    const co = Array.isArray(m.companies) ? m.companies[0] : m.companies;
    return co
      ? [
          {
            id: m.company_id,
            role: m.role,
            name: co.name as string,
            company_template: co.company_template as string,
            is_demo: co.is_demo as boolean,
            pipeline_version: co.pipeline_version as number,
          },
        ]
      : [];
  });
  if (!companies.length) return { companies, company: null };
  const id = txt(requestedCompany, 100),
    template = templateKey(requestedTemplate);
  const company = id
    ? companies.find((x) => x.id === id) || null
    : companies.find((x) => x.is_demo && x.company_template === template) ||
      companies.find((x) => !x.is_demo) ||
      companies[0];
  return { companies, company };
}
async function context(
  requestedCompany?: unknown,
  requestedTemplate?: unknown,
) {
  const s = await createClient(),
    {
      data: { user },
      error,
    } = await s.auth.getUser();
  if (error || !user) return null;
  let state = await access(s, user.id, requestedCompany, requestedTemplate);
  if (!requestedCompany) {
    const template = templateKey(requestedTemplate),
      hasReal = state.companies.some((x) => !x.is_demo),
      hasDemo = state.companies.some(
        (x) => x.is_demo && x.company_template === template,
      );
    if (!hasReal && !hasDemo) {
      await seedDemo(s, user.id, template);
      state = await access(s, user.id, requestedCompany, requestedTemplate);
    }
  }
  return { s, user, ...state };
}
async function snapshot(s: SupabaseClient, c: string) {
  const opportunityFields =
    "id,company_id,contact_id,title,stage_id,owner_id,estimated_value,status,source,details,commercial_availability,next_action_type,next_action_at,next_action_note,last_interaction_at,created_at,updated_at,stage_entered_at,waiting_started_at,closed_at,tags,proposal_url,contract_url,drive_url,competitor,negotiation_summary,objections,win_reason";
  const baselineOpportunityFields =
    "id,company_id,contact_id,title,stage_id,owner_id,estimated_value,status,source,details,last_interaction_at,created_at,updated_at,stage_entered_at,waiting_started_at,closed_at";
  const loadOpportunities = async () => {
    const enriched = await s
      .from("opportunities")
      .select(opportunityFields)
      .eq("company_id", c)
      .order("updated_at", { ascending: false });
    if (!enriched.error) return enriched;
    // Keep the workspace usable while an optional production migration is propagating.
    console.warn("workspace opportunities enriched select failed; using baseline", enriched.error);
    return s
      .from("opportunities")
      .select(baselineOpportunityFields)
      .eq("company_id", c)
      .order("updated_at", { ascending: false });
  };
  const [stages, opps, contacts, acts, history, profiles, memberships] =
    await Promise.all([
      s
        .from("pipeline_stages")
        .select("id,name,position,kind")
        .eq("company_id", c)
        .order("position"),
      loadOpportunities(),
      s.from("contacts").select("id,company_id,name,phone,email,organization,created_at").eq("company_id", c),
      s.from("activities").select("id,company_id,opportunity_id,owner_id,status,due_at,type,note,created_at").eq("company_id", c).order("due_at"),
      s
        .from("opportunity_history")
        .select("id,company_id,opportunity_id,event,description,created_at,actor_id,payload")
        .eq("company_id", c)
        .order("created_at", { ascending: false }),
      s.from("profiles").select("id,display_name"),
      s.from("memberships").select("user_id").eq("company_id", c),
    ]);
  for (const r of [
    stages,
    opps,
    contacts,
    acts,
    history,
    profiles,
    memberships,
  ])
    if (r.error) throw r.error;
  const contactMap = new Map((contacts.data || []).map((x) => [x.id, x])),
    stageMap = new Map((stages.data || []).map((x) => [x.id, x])),
    profileMap = new Map((profiles.data || []).map((x) => [x.id, x]));
  const opportunities = (opps.data || []).map((o) => {
    const ct = contactMap.get(o.contact_id),
      st = stageMap.get(o.stage_id),
      owner = profileMap.get(o.owner_id);
    return {
      ...o,
      estimated_value:
        o.estimated_value == null ? null : Number(o.estimated_value),
      contact_name: ct?.name || "Contato",
      phone: ct?.phone || null,
      organization: ct?.organization || null,
      stage_name: st?.name || "Estágio",
      stage_kind: st?.kind || "open",
      owner_name: owner?.display_name || "Responsável",
    };
  });
  return {
    contacts: contacts.data || [],
    stages: stages.data || [],
    opportunities,
    activities: acts.data || [],
    history: history.data || [],
    owners: (memberships.data || []).map(
      (m) =>
        profileMap.get(m.user_id) || {
          id: m.user_id,
          display_name: "Responsável",
        },
    ),
  };
}
export async function GET(request: Request) {
  try {
    const url = new URL(request.url),
      ctx = await context(
        url.searchParams.get("companyId"),
        url.searchParams.get("template"),
      );
    if (!ctx) return fail("Entre na sua conta para continuar.", 401);
    if (!ctx.company)
      return fail(
        "Seu acesso ainda não foi vinculado a uma empresa. Contate a Aether Works.",
        403,
      );
    const { data: branding, error: brandingError } = await ctx.s.from("company_branding")
      .select("accent_color").eq("company_id", ctx.company.id).maybeSingle();
    if (brandingError) console.warn("workspace branding unavailable", brandingError);
    const messagesEnabled = await isCompanyModuleEnabled(ctx.s, ctx.company.id, "messages");
    return Response.json({
      company: {
        id: ctx.company.id,
        name: ctx.company.name,
        demo: ctx.company.is_demo,
        pipelineVersion: ctx.company.pipeline_version,
        accentColor: brandColorOrDefault(branding?.accent_color),
        modules: { messages: messagesEnabled },
      },
      companies: ctx.companies,
      template: ctx.company.company_template,
      ...(await snapshot(ctx.s, ctx.company.id)),
    });
  } catch (error) {
    console.error("workspace GET", error);
    return fail("Não foi possível carregar o ambiente.", 500);
  }
}
export async function POST(request: Request) {
  try {
    const origin = request.headers.get("origin");
    if (
      !isRequestOriginAllowed(
        origin,
        request.url,
        process.env.RAILWAY_PUBLIC_DOMAIN,
      )
    )
      return fail("Origem não permitida.", 403);
    if (Number(request.headers.get("content-length") || 0) > 12000)
      return fail("Comando muito grande.", 413);
    const body = (await request.json()) as Record<string, unknown>;
    const ctx = await context(body.companyId, body.template);
    if (!ctx) return fail("Sua sessão expirou. Entre novamente.", 401);
    const rate = consumeRateLimit(`workspace-mutation:${ctx.user.id}`, 60, 10 * 60 * 1000);
    if (!rate.allowed) return Response.json({ error: "Muitas ações em pouco tempo. Aguarde e tente novamente." }, { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } });
    if (!ctx.company) return fail("Empresa não vinculada à sua conta.", 403);
    const { requestId, companyId, template, ...command } = body;
    if (companyId !== ctx.company.id)
      return fail("Empresa não autorizada.", 403);
    if (
      typeof requestId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[1-8][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
        requestId,
      )
    )
      return fail("Identificador de requisição inválido.");
    if (JSON.stringify(command).length > 10000)
      return fail("Comando muito grande.", 413);
    const rpcName =
      command.kind === "pipeline_configure"
        ? "configure_pipeline"
        : command.kind === "feedback"
          ? "submit_product_feedback"
          : command.kind === "undo_stage"
            ? "undo_stage_change"
          : "apply_workspace_command";
    const args =
      command.kind === "feedback"
        ? {
            p_company_id: ctx.company.id,
            p_request_id: requestId,
            p_context: command.context,
            p_message: command.message,
          }
        : command.kind === "undo_stage"
          ? {
              p_company_id: ctx.company.id,
              p_request_id: requestId,
              p_opportunity_id: command.id,
              p_expected_stage_id: command.expectedStageId,
              p_previous_stage_id: command.previousStageId,
            }
        : {
            p_company_id: ctx.company.id,
            p_request_id: requestId,
            p_command: command,
          };
    const { data, error } = await ctx.s.rpc(rpcName, args);
    if (error) {
      // Do not log command contents, phone, JWT, or database error details.
      console.error("workspace command failed", {
        code: error.code,
        kind: command.kind,
      });
      if (error.code === "42501")
        return fail("Empresa ou oportunidade não autorizada.", 403);
      if (error.code === "23505")
        return fail(
          "Este telefone já está vinculado a outro cliente nesta empresa.",
          409,
        );
      if (error.code === "P0001") return fail(error.message);
      if (
        ["22P02", "23514", "22003", "22007", "22008", "23503"].includes(
          error.code,
        )
      )
        return fail("Verifique os dados informados.");
      return fail(
        "Não foi possível confirmar a gravação. Atualize a tela ou tente novamente; a operação é protegida contra repetição.",
        500,
      );
    }
    if (!data?.ok && data?.code === "DUPLICATE_CONTACT")
      return Response.json(data, { status: 409 });
    if (!data?.ok)
      return fail(
        "Resposta inválida do servidor. Atualize a tela antes de tentar novamente.",
        500,
      );
    return Response.json(data);
  } catch (error) {
    if (error instanceof SyntaxError) return fail("Dados inválidos.");
    console.error("workspace POST unavailable", {
      type: error instanceof Error ? error.name : "unknown",
    });
    return fail(
      "Não foi possível confirmar a gravação. Atualize a tela ou tente novamente com a mesma operação.",
      500,
    );
  }
}
