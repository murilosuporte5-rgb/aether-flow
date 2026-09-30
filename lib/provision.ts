import "server-only";
import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { templates, demoNames, stageKind, type TemplateKey } from "./templates";
import { SUPABASE_URL } from "./supabase/config";

export function serviceClient() {
  const secret = process.env.SUPABASE_SECRET_KEY;
  if (!secret)
    throw new Error("SUPABASE_SECRET_KEY is required for company invitations");
  return createClient(SUPABASE_URL, secret, {
    auth: { autoRefreshToken: false, persistSession: false },
  });
}
function checked<T>(result: { data: T; error: unknown }): NonNullable<T> {
  if (result.error) throw result.error;
  if (result.data == null) throw new Error("Supabase returned no data");
  return result.data as NonNullable<T>;
}
function assertOk(result: { error: unknown }) {
  if (result.error) throw result.error;
}
export async function isAetherAdmin(client: SupabaseClient, userId: string) {
  const { data, error } = await client
    .from("aether_admins")
    .select("user_id")
    .eq("user_id", userId)
    .maybeSingle();
  if (error) throw error;
  return !!data;
}
const dueDate = (days: number, hour: number) => {
  const local = new Date(
    new Date().toLocaleString("en-US", { timeZone: "America/Sao_Paulo" }),
  );
  return new Date(
    local.getTime() +
      days * 86400000 +
      (hour - local.getHours()) * 3600000 -
      local.getMinutes() * 60000 +
      3 * 3600000,
  ).toISOString();
};

export async function seedDemo(
  client: SupabaseClient,
  userId: string,
  t: TemplateKey,
) {
  const conf = templates[t];
  const stagePositions = [2, 4, 3, 1, 4, 2, 5, 0, 3, 4, 2, 1, 0, 5, 6, 3];
  const days = [-1, -1, 1, 0, 0, 0, 3, 5, 0, 2, 0, 7, 0, 1, 4, -2];
  const hours = [10, 16, 11, 14, 14, 15, 9, 10, 17, 13, 11, 10, 16, 9, 12, 15];
  const samples = demoNames.map((name, i) => ({
    name,
    organization: i % 5 === 2 ? name : null,
    title: conf.titles[i % conf.titles.length],
    stagePosition: stagePositions[i],
    value: (i + 2) * 1350,
    dueAt: i === 3 || i === 14 || i === 15 ? null : dueDate(days[i], hours[i]),
    lastInteractionAt: dueDate(-i % 5, 10),
    details: "Dados fictícios para demonstração",
  }));
  const { data, error } = await client.rpc("ensure_demo_workspace", {
    p_template: t,
    p_stages: conf.stages.map((name, i) => ({
      name,
      position: i,
      kind: stageKind(t, i),
    })),
    p_samples: samples,
  });
  if (error) throw error;
  if (!data) throw new Error("Demo workspace returned no company");
  return data as string;
}

export async function provisionCompany(
  admin: SupabaseClient,
  {
    name,
    template,
    email,
    baseUrl,
  }: { name: string; template: TemplateKey; email: string; baseUrl: string },
) {
  const company = checked(
    await admin
      .from("companies")
      .insert({ name, company_template: template, is_demo: false })
      .select("id")
      .single(),
  );
  try {
    const conf = templates[template];
    assertOk(
      await admin
        .from("pipeline_stages")
        .insert(
          conf.stages.map((stage, i) => ({
            company_id: company.id,
            name: stage,
            position: i,
            kind: stageKind(template, i),
          })),
        ),
    );
    const invited = await admin.auth.admin.inviteUserByEmail(email, {
      redirectTo: `${baseUrl}/activate`,
    });
    if (invited.error || !invited.data.user)
      throw invited.error || new Error("Invite returned no user");
    assertOk(
      await admin
        .from("memberships")
        .insert({
          company_id: company.id,
          user_id: invited.data.user.id,
          role: "owner",
        }),
    );
    return { companyId: company.id, email };
  } catch (error) {
    await admin.from("companies").delete().eq("id", company.id);
    throw error;
  }
}
