import { createClient } from "@/lib/supabase/server";
import { templates, stageKind, type TemplateKey } from "@/lib/templates";
import { isRequestOriginAllowed } from "@/lib/request-origin";
import { consumeRateLimit } from "@/lib/rate-limit";
export const dynamic = "force-dynamic";
const fail = (error: string, status = 400) =>
  Response.json({ error }, { status });
export async function POST(request: Request) {
  try {
    if (
      !isRequestOriginAllowed(
        request.headers.get("origin"),
        request.url,
        process.env.RAILWAY_PUBLIC_DOMAIN,
      )
    )
      return fail("Origem não permitida.", 403);
    if (Number(request.headers.get("content-length") || 0) > 4000)
      return fail("Dados excedem o limite.", 413);
    const supabase = await createClient();
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser();
    if (userError || !user)
      return fail("Entre na sua conta para continuar.", 401);
    const rate = consumeRateLimit(`onboarding:${user.id}`, 5, 10 * 60 * 1000);
    if (!rate.allowed)
      return Response.json(
        { error: "Muitas tentativas. Aguarde antes de tentar novamente." },
        { status: 429, headers: { "Retry-After": String(rate.retryAfterSeconds) } },
      );
    const body = (await request.json()) as Record<string, unknown>;
    const name =
      typeof body.companyName === "string" ? body.companyName.trim() : "";
    const template =
      typeof body.template === "string" &&
      Object.hasOwn(templates, body.template)
        ? (body.template as TemplateKey)
        : null;
    if (name.length < 2 || name.length > 120 || !template)
      return fail("Verifique empresa e segmento.");
    const conf = templates[template];
    const { data, error } = await supabase.rpc("ensure_owned_workspace", {
      p_name: name,
      p_template: template,
      p_stages: conf.stages.map((stage, i) => ({
        name: stage,
        kind: stageKind(template, i),
      })),
    });
    if (error) {
      console.error("onboarding command failed", { code: error.code });
      if (error.code === "42501") return fail("Sessão não autorizada.", 403);
      if (error.code === "P0001") return fail(error.message);
      return fail(
        "Não foi possível confirmar a configuração. Tente novamente; não será criada outra empresa.",
        500,
      );
    }
    if (!data?.ok)
      return fail("Não foi possível confirmar a configuração.", 500);
    return Response.json(data);
  } catch {
    return fail(
      "Não foi possível concluir a configuração. Tente novamente.",
      500,
    );
  }
}
