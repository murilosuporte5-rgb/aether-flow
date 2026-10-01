import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

// Match Next's canonical local request origin without relaxing CSRF checks.
const base = "http://localhost:3000";
const config = JSON.parse(
  await fs.readFile(process.env.LOCAL_QA_STATUS_FILE, "utf8"),
);
const api = config.API_URL;
assert.ok(
  api && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(api).hostname),
  "Local Supabase required",
);
const anon = config.PUBLISHABLE_KEY || config.ANON_KEY;
const secret = config.SECRET_KEY || config.SERVICE_ROLE_KEY;
assert.ok(anon && secret, "Disposable local Auth keys required");
const clientOptions = {
  auth: { persistSession: false, autoRefreshToken: false },
};
const admin = createClient(api, secret, clientOptions);
const fixtures = [];
const results = [];
const dir = "qa-results";
await fs.mkdir(dir, { recursive: true });
let browser;
let activePage;
const checked = async (promise) => {
  const r = await promise;
  if (r.error) throw new Error(r.error.message);
  return r.data;
};
const poll = async (label, fn) => {
  for (let n = 0; n < 60; n++) {
    if (await fn()) return;
    await new Promise((r) => setTimeout(r, 150));
  }
  throw new Error("Timeout: " + label);
};
const record = (name, width) => results.push({ name, width, status: "PASS" });
const count = async (table, company, extra = {}) => {
  let q = admin
    .from(table)
    .select("*", { count: "exact", head: true })
    .eq("company_id", company);
  for (const [key, value] of Object.entries(extra)) q = q.eq(key, value);
  const r = await q;
  if (r.error) throw new Error(r.error.message);
  return r.count;
};
const opp = async (id) =>
  checked(admin.from("opportunities").select("*").eq("id", id).single());
const command = (tenant, payload, requestId = randomUUID()) =>
  tenant.client.rpc("apply_workspace_command", {
    p_company_id: tenant.company,
    p_request_id: requestId,
    p_command: payload,
  });
const futureInput = () =>
  new Date(Date.now() + 2 * 86400000 - 3 * 3600000).toISOString().slice(0, 16);
const futureISO = () => new Date(Date.now() + 2 * 86400000).toISOString();
async function fixture(label) {
  const email = "qa-" + randomUUID() + "@example.invalid";
  const password = randomBytes(24).toString("base64url");
  const created = await checked(
    admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: label },
    }),
  );
  const f = { user: created.user.id, email, password, company: null };
  fixtures.push(f);
  const company = await checked(
    admin
      .from("companies")
      .insert({ name: label, company_template: "generic", is_demo: false })
      .select("id")
      .single(),
  );
  f.company = company.id;
  await checked(
    admin
      .from("memberships")
      .insert({ company_id: f.company, user_id: f.user, role: "owner" }),
  );
  f.stages = await checked(
    admin
      .from("pipeline_stages")
      .insert([
        { company_id: f.company, name: "Novo", position: 0, kind: "open" },
        {
          company_id: f.company,
          name: "Negociação",
          position: 1,
          kind: "open",
        },
        { company_id: f.company, name: "Ganho", position: 2, kind: "won" },
        { company_id: f.company, name: "Perdido", position: 3, kind: "lost" },
      ])
      .select("*"),
  );
  f.client = createClient(api, anon, clientOptions);
  await checked(f.client.auth.signInWithPassword({ email, password }));
  return f;
}
async function bareUser(label) {
  const email = "qa-" + randomUUID() + "@example.invalid",
    password = randomBytes(24).toString("base64url");
  const created = await checked(
    admin.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: { full_name: label },
    }),
  );
  const f = {
    user: created.user.id,
    email,
    password,
    company: null,
    client: createClient(api, anon, clientOptions),
  };
  fixtures.push(f);
  await checked(f.client.auth.signInWithPassword({ email, password }));
  return f;
}
const core = (page) => page.locator("form.core-form");
const submit = (page) => core(page).locator('button[type="submit"]').click();
const configure = (tenant, stages, expectedVersion, requestId = randomUUID()) =>
  tenant.client.rpc("configure_pipeline", {
    p_company_id: tenant.company,
    p_request_id: requestId,
    p_command: { kind: "pipeline_configure", stages, expectedVersion },
  });
async function overflow(page, label) {
  const d = await page.evaluate(() => ({
    width: document.documentElement.clientWidth,
    scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(d.scroll <= d.width + 2, label + " overflow");
}
try {
  browser = await chromium.launch({ headless: true });
  for (const width of [360, 390, 412, 768]) {
    const tenant = await fixture("QA Daily " + width),
      other = await fixture("QA Member " + width);
    await checked(
      admin.from("memberships").insert({
        company_id: tenant.company,
        user_id: other.user,
        role: "member",
      }),
    );
    await checked(
      admin.auth.admin.updateUserById(other.user, {
        user_metadata: { aether_admin: true, role: "admin" },
      }),
    );
    const context = await browser.newContext({
      viewport: { width, height: width === 768 ? 1024 : 844 },
    });
    const external = [],
      errors = [];
    await context.route("**/*", (route) => {
      const url = new URL(route.request().url());
      if (url.hostname === "wa.me")
        return route.fulfill({ status: 200, body: "Opened only, no send." });
      if (["localhost", "127.0.0.1", "[::1]"].includes(url.hostname))
        return route.continue();
      if (
        ["fonts.googleapis.com", "fonts.gstatic.com"].includes(url.hostname) &&
        route.request().method() === "GET" &&
        ["stylesheet", "font"].includes(route.request().resourceType())
      )
        return route.continue();
      external.push(url.hostname);
      return route.abort();
    });
    const page = await context.newPage();
    activePage = page;
    page.on("pageerror", (e) => errors.push(e.message));
    await page.goto(base + "/login");
    await page.getByLabel("E-mail", { exact: true }).fill(tenant.email);
    await page.getByLabel("Senha", { exact: true }).fill(tenant.password);
    await page
      .getByRole("button", { name: "Entrar no Aether Flow", exact: true })
      .click();
    await page.waitForURL(base + "/");
    await poll("ready", () =>
      page
        .getByRole("button", { name: "Nova oportunidade", exact: true })
        .isEnabled(),
    );
    await page.getByText("Comece em 3 passos", { exact: true }).waitFor();
    await page
      .getByRole("button", { name: "Resolver pendências", exact: true })
      .click();
    await page
      .getByText("0 de 0 pendências resolvidas", { exact: true })
      .waitFor();
    await page
      .getByRole("button", { name: "Sair da fila", exact: true })
      .click();
    record("empty_state_and_zero_queue", width);
    const stage = tenant.stages.find((s) => s.kind === "open");
    let contactId;
    const ids = [];
    for (let n = 0; n < 20; n++) {
      const r = await command(tenant, {
        kind: "create",
        contactName: "QA cliente diário",
        phone: "+12025550130",
        title: "QA Daily " + String(n).padStart(2, "0"),
        stageId: stage.id,
        value: String(100 + n),
        ...(contactId ? { reuseContactId: contactId } : {}),
      });
      assert.equal(r.data?.ok, true, r.error?.message);
      ids.push(r.data.id);
      if (!contactId)
        contactId = (
          await checked(
            admin
              .from("contacts")
              .select("id")
              .eq("company_id", tenant.company)
              .single(),
          )
        ).id;
    }
    await page.reload();
    await poll("loaded twenty", () =>
      page
        .getByRole("button", { name: "Nova oportunidade", exact: true })
        .isEnabled(),
    );
    await page
      .getByRole("button", { name: "Resolver pendências", exact: true })
      .click();
    await page
      .getByText("0 de 20 pendências resolvidas", { exact: true })
      .waitFor();
    const panel = page.locator("aside.detail");
    await panel
      .getByRole("heading", { name: "QA cliente diário", exact: true })
      .waitFor();
    const popup = context.waitForEvent("page");
    await panel
      .getByRole("button", {
        name: "Falar com QA cliente diário no WhatsApp",
        exact: true,
      })
      .click();
    const opened = await popup;
    await opened.close();
    await poll(
      "opened event",
      async () =>
        (await count("opportunity_history", tenant.company, {
          event: "whatsapp_opened",
        })) === 1,
    );
    assert.equal(
      await page
        .getByText("0 de 20 pendências resolvidas", { exact: true })
        .isVisible(),
      true,
    );
    record("whatsapp_open_not_queue_resolution", width);
    await panel
      .getByRole("button", { name: "Editar dados", exact: true })
      .click();
    await core(page)
      .getByLabel("Oportunidade", { exact: false })
      .fill("QA Daily 00 editada");
    await submit(page);
    await poll(
      "edited persisted",
      async () => (await opp(ids[0])).title === "QA Daily 00 editada",
    );
    await core(page).waitFor({ state: "hidden" });
    assert.equal(
      await page
        .getByText("0 de 20 pendências resolvidas", { exact: true })
        .isVisible(),
      true,
    );
    record("edit_not_queue_resolution", width);
    await panel
      .getByRole("button", { name: "Aguardar cliente", exact: true })
      .click();
    assert.equal(
      await core(page)
        .getByLabel("Próximo passo", { exact: false })
        .inputValue(),
      "Aguardar cliente",
    );
    await submit(page);
    assert.equal((await opp(ids[0])).next_action_at, null);
    await core(page)
      .getByLabel("Data e horário", { exact: false })
      .fill(futureInput());
    await submit(page);
    await poll(
      "waiting persisted",
      async () => (await opp(ids[0])).next_action_type === "Aguardar cliente",
    );
    await page
      .getByText("1 de 20 pendências resolvidas", { exact: true })
      .waitFor();
    const waiting = await checked(
      admin
        .from("activities")
        .select("*")
        .eq("opportunity_id", ids[0])
        .eq("status", "pending")
        .single(),
    );
    assert.ok(waiting.created_at && waiting.due_at);
    const waitStarted = (await opp(ids[0])).waiting_started_at;
    assert.ok(waitStarted, "Waiting begins when it is explicitly marked");
    const revisedWait = await command(tenant, {
      kind: "reschedule",
      id: ids[0],
      actionType: "Aguardar cliente",
      dueAt: futureISO(),
    });
    assert.equal(revisedWait.data?.ok, true, revisedWait.error?.message);
    assert.equal(
      (await opp(ids[0])).waiting_started_at,
      waitStarted,
      "Review rescheduling must not reset the waiting start",
    );
    record("waiting_review_required_and_queue_advance", width);
    for (let n = 1; n < 20; n++) {
      await panel
        .getByText("QA Daily " + String(n).padStart(2, "0"), { exact: true })
        .waitFor();
      await panel.getByRole("button", { name: "Agendar", exact: true }).click();
      await core(page)
        .getByLabel("Data e horário", { exact: false })
        .fill(futureInput());
      await submit(page);
      await page
        .getByText(`${n + 1} de 20 pendências resolvidas`, { exact: true })
        .waitFor();
    }
    await page.getByText("Fila concluída.", { exact: true }).waitFor();
    assert.equal(
      await count("activities", tenant.company, { status: "pending" }),
      20,
    );
    record("sequential_twenty_real_mutations", width);
    await page
      .getByRole("button", { name: "Sair da fila", exact: true })
      .click();
    const mobileMenu = page.getByRole("button", { name: "Abrir menu", exact: true });
    if (await mobileMenu.isVisible()) await mobileMenu.click();
    await page.getByRole("link", { name: "Contatos", exact: true }).click();
    await page.waitForURL(base + "/contatos");
    await page
      .getByRole("button", { name: "QA cliente diário", exact: true })
      .waitFor();
    await page
      .getByLabel("Buscar contatos", { exact: true })
      .fill("+1 (202) 555-0130");
    await page
      .getByRole("button", { name: "QA cliente diário", exact: true })
      .click();
    await page
      .getByRole("dialog", { name: "Contato QA cliente diário", exact: true })
      .waitFor();
    assert.equal(await page.locator(".contact-opportunity").count(), 20);
    assert.ok(
      (await page
        .getByRole("region", { name: "Resultados da busca global" })
        .count()) === 0,
    );
    await page
      .getByRole("button", { name: "Fechar contato", exact: true })
      .click();
    record("contact_twenty_opportunities_phone_search_timeline", width);
    await page
      .getByLabel("Busca global", { exact: true })
      .fill("+1 (202) 555-0130");
    await page
      .getByRole("region", { name: "Resultados da busca global" })
      .waitFor();
    assert.ok(
      (await page
        .getByRole("region", { name: "Resultados da busca global" })
        .getByRole("button")
        .count()) > 1,
    );
    await overflow(page, "global search");
    await page
      .getByRole("button", { name: "Fechar busca", exact: true })
      .click();
    record("global_normalized_phone_search", width);
    const listed = await checked(
      admin
        .from("pipeline_stages")
        .select("id,name,kind,position")
        .eq("company_id", tenant.company)
        .order("position"),
    );
    const directPipeline = await tenant.client
      .from("pipeline_stages")
      .insert({
        company_id: tenant.company,
        name: "Forbidden direct stage",
        position: 25,
        kind: "open",
      });
    assert.ok(
      directPipeline.error,
      "Pipeline changes must use the guarded command",
    );
    assert.ok(
      (await configure({ ...other, company: tenant.company }, listed, 0)).error,
      "Member must not configure even with spoofed metadata",
    );
    assert.ok((await configure({ ...other, company: tenant.company }, other.stages, 0)).error);
    record("pipeline_owner_authorization", width);
    const empty = listed.find((s) => s.name === "Negociação");
    const revised = listed
      .filter((s) => s.id !== empty.id)
      .map((s, i) => ({ ...s, name: i === 0 ? "Entrada" : s.name }));
    revised.splice(1, 0, {
      id: randomUUID(),
      name: "Análise",
      kind: "open",
      position: 1,
    });
    const requestId = randomUUID();
    const first = await configure(tenant, revised, 0, requestId);
    assert.equal(first.data?.ok, true, first.error?.message);
    assert.equal(
      (await configure(tenant, revised, 0, requestId)).data?.pipelineVersion,
      1,
    );
    assert.ok(
      (
        await configure(
          tenant,
          revised.filter((s) => s.id !== stage.id),
          1,
        )
      ).error,
      "used stage deletion rejected",
    );
    assert.ok(
      (
        await configure(
          tenant,
          revised.map((s) => ({
            ...s,
            kind: s.id === stage.id ? "won" : s.kind,
          })),
          1,
        )
      ).error,
    );
    record(
      "pipeline_rename_add_empty_delete_used_protection_idempotency",
      width,
    );
    const left = [...revised].reverse(),
      right = [...revised.slice(1), revised[0]];
    const concurrent = await Promise.all([
      configure(tenant, left, 1),
      configure(tenant, right, 1),
    ]);
    assert.equal(concurrent.filter((r) => r.data?.ok).length, 1);
    assert.equal(concurrent.filter((r) => r.error).length, 1);
    const positioned = await checked(
      admin
        .from("pipeline_stages")
        .select("position,kind")
        .eq("company_id", tenant.company)
        .order("position"),
    );
    assert.deepEqual(
      positioned.map((s) => s.position),
      [0, 1, 2, 3],
    );
    assert.equal(positioned.filter((s) => s.kind === "won").length, 1);
    assert.equal(positioned.filter((s) => s.kind === "lost").length, 1);
    record("concurrent_pipeline_version_order", width);
    const oldEntry = (await opp(ids[0])).stage_entered_at;
    assert.ok(oldEntry);
    const newStage = (
      await checked(
        admin
          .from("pipeline_stages")
          .select("*")
          .eq("company_id", tenant.company),
      )
    ).find((s) => s.kind === "open" && s.id !== stage.id);
    const moved = await command(tenant, {
      kind: "stage",
      id: ids[0],
      stageId: newStage.id,
    });
    assert.equal(moved.data?.ok, true);
    const updated = await opp(ids[0]);
    assert.ok(updated.stage_entered_at >= oldEntry);
    const h = await checked(
      admin
        .from("opportunity_history")
        .select("*")
        .eq("opportunity_id", ids[0])
        .eq("event", "stage_changed")
        .single(),
    );
    assert.equal(h.payload.from_name, "Entrada");
    assert.equal(h.payload.to_name, "Análise");
    assert.ok(h.actor_id && h.payload.timestamp);
    record("recorded_stage_entry_structured_history", width);
    await page.reload();
    await poll("reloaded contacts", () =>
      page
        .getByRole("button", { name: "Nova oportunidade", exact: true })
        .isEnabled(),
    );
    const pipelineMenu = page.getByRole("button", { name: "Abrir menu", exact: true });
    if (await pipelineMenu.isVisible()) await pipelineMenu.click();
    await page.getByRole("button", { name: "Pipeline", exact: true }).click();
    await page
      .getByRole("button", { name: "Configurar pipeline", exact: true })
      .click();
    const settings = page.getByRole("dialog", {
      name: "Configurar pipeline",
      exact: true,
    });
    await settings
      .getByLabel("Nome da etapa 1", { exact: true })
      .fill("Etapa revisada");
    await overflow(page, "pipeline settings");
    await settings
      .getByRole("button", { name: "Salvar pipeline", exact: true })
      .click();
    await settings.waitFor({ state: "hidden" });
    assert.equal(
      (
        await checked(
          admin
            .from("companies")
            .select("pipeline_version")
            .eq("id", tenant.company)
            .single(),
        )
      ).pipeline_version,
      3,
    );
    record("pipeline_ui_save_mobile_keyboard", width);
    const feedback = page.getByRole("region", {
      name: "Feedback do produto",
      exact: true,
    });
    await feedback.getByRole("button", { name: "Sim", exact: true }).click();
    await feedback
      .getByLabel("O que você tentou fazer?", { exact: true })
      .fill("QA fictícia: testei a fila de pendências");
    await feedback
      .getByRole("button", { name: "Enviar relato", exact: true })
      .click();
    await feedback
      .getByText("Relato registrado. Obrigado.", { exact: true })
      .waitFor();
    assert.equal(await count("product_feedback", tenant.company), 1);
    for (let n = 0; n < 4; n++)
      await checked(
        tenant.client.rpc("submit_product_feedback", {
          p_company_id: tenant.company,
          p_request_id: randomUUID(),
          p_context: "pipeline",
          p_message: "QA limitada " + n,
        }),
      );
    assert.ok(
      (
        await tenant.client.rpc("submit_product_feedback", {
          p_company_id: tenant.company,
          p_request_id: randomUUID(),
          p_context: "pipeline",
          p_message: "QA limite excedido",
        })
      ).error,
    );
    const foreign = await other.client
      .from("product_feedback")
      .select("*")
      .eq("company_id", tenant.company);
    assert.equal(foreign.data?.length, 0);
    record("feedback_persistence_rate_limit_actor_isolation", width);
    assert.deepEqual(errors, []);
    assert.deepEqual(external, []);
    await overflow(page, "daily app");
    await page.screenshot({
      path: dir + "/daily-" + width + ".png",
      fullPage: false,
    });
    await context.close();
    activePage = null;
  }
  const setup = await bareUser("QA atomic onboarding");
  const validStages = [
    { name: "Novo", kind: "open" },
    { name: "Ganho", kind: "won" },
    { name: "Perdido", kind: "lost" },
  ];
  const onboard = (f, stages = validStages) =>
    f.client.rpc("ensure_owned_workspace", {
      p_name: "QA atomic workspace",
      p_template: "generic",
      p_stages: stages,
    });
  const invalid = await onboard(setup, [
    validStages[0],
    { name: "", kind: "won" },
    validStages[2],
  ]);
  assert.ok(invalid.error);
  const before = await admin
    .from("companies")
    .select("id", { count: "exact", head: true })
    .eq("owner_user_id", setup.user);
  assert.equal(
    before.count,
    0,
    "Failed setup must not leave a company/membership/stage",
  );
  record("onboarding_partial_write_rollback", 360);
  const setupContext = await browser.newContext({
    viewport: { width: 360, height: 844 },
  });
  await setupContext.route("**/*", (route) => {
    const host = new URL(route.request().url()).hostname;
    if (["localhost", "127.0.0.1", "[::1]"].includes(host))
      return route.continue();
    if (
      ["fonts.googleapis.com", "fonts.gstatic.com"].includes(host) &&
      route.request().method() === "GET" &&
      ["stylesheet", "font"].includes(route.request().resourceType())
    )
      return route.continue();
    return route.abort();
  });
  const setupPage = await setupContext.newPage();
  activePage = setupPage;
  await setupPage.goto(base + "/login");
  await setupPage.getByLabel("E-mail", { exact: true }).fill(setup.email);
  await setupPage.getByLabel("Senha", { exact: true }).fill(setup.password);
  await setupPage
    .getByRole("button", { name: "Entrar no Aether Flow", exact: true })
    .click();
  await setupPage
    .getByLabel("Nome da empresa", { exact: true })
    .fill("QA atomic workspace");
  await setupPage
    .getByRole("button", { name: "Criar meu ambiente", exact: true })
    .click();
  await poll("onboarding UI ready", () =>
    setupPage
      .getByRole("button", { name: "Nova oportunidade", exact: true })
      .isEnabled(),
  );
  const owned = await checked(
    admin
      .from("companies")
      .select("*")
      .eq("owner_user_id", setup.user)
      .single(),
  );
  setup.company = owned.id;
  assert.equal(await count("memberships", owned.id), 1);
  assert.ok((await count("pipeline_stages", owned.id)) >= 3);
  await overflow(setupPage, "mobile onboarding");
  const repeated = await Promise.all([onboard(setup), onboard(setup)]);
  assert.ok(repeated.every((r) => r.data?.companyId === owned.id));
  record("onboarding_real_ui_concurrent_idempotency", 360);
  await setupPage.screenshot({
    path: dir + "/onboarding-360.png",
    fullPage: false,
  });
  await setupContext.close();
  activePage = null;
  const repair = await bareUser("QA setup repair");
  repair.company = (
    await checked(
      admin
        .from("companies")
        .insert({
          name: "QA existing incomplete",
          company_template: "generic",
          is_demo: false,
          owner_user_id: repair.user,
        })
        .select("id")
        .single(),
    )
  ).id;
  await checked(
    admin
      .from("memberships")
      .insert({
        company_id: repair.company,
        user_id: repair.user,
        role: "owner",
      }),
  );
  assert.equal((await onboard(repair)).data?.companyId, repair.company);
  assert.equal(await count("pipeline_stages", repair.company), 3);
  assert.equal(
    (
      await checked(
        admin
          .from("companies")
          .select("name")
          .eq("id", repair.company)
          .single(),
      )
    ).name,
    "QA existing incomplete",
  );
  record("owned_incomplete_onboarding_repair_without_overwrite", 360);
} catch (error) {
  results.push({ name: "failure", status: "FAIL", message: error.message });
  if (activePage)
    await activePage
      .screenshot({ path: dir + "/daily-failure.png", fullPage: false })
      .catch(() => {});
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  // Delete company fixtures first; memberships may reference another fixture user.
  let cleanupFailed = false;
  for (const f of fixtures) {
    if (f.company) {
      const r = await admin.from("companies").delete().eq("id", f.company);
      if (r.error) {
        results.push({
          name: "cleanup_company",
          status: "FAIL",
          message: r.error.message,
        });
        cleanupFailed = true;
        process.exitCode = 1;
      }
    }
  }
  if (!cleanupFailed)
    for (const f of fixtures) {
      const r = await admin.auth.admin.deleteUser(f.user);
      if (r.error) {
        results.push({
          name: "cleanup_user",
          status: "FAIL",
          message: r.error.message,
        });
        process.exitCode = 1;
      }
    }
  const report = {
    environment: "DISPOSABLE_LOCAL_SUPABASE_AUTH_POSTGRES_RLS",
    commit: process.env.TESTED_HEAD_SHA || "LOCAL",
    productionTested: false,
    mockAuthentication: false,
    whatsappSent: false,
    results,
  };
  await fs.writeFile(
    dir + "/daily-summary.json",
    JSON.stringify(report, null, 2),
  );
  console.log(
    JSON.stringify({
      environment: report.environment,
      passed: results.filter((r) => r.status === "PASS").length,
      failures: results.filter((r) => r.status === "FAIL"),
      productionTested: false,
    }),
  );
}
