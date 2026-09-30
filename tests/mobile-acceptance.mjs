import assert from "node:assert/strict";
import { randomUUID, randomBytes } from "node:crypto";
import fs from "node:fs/promises";
import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";

const base = "http://127.0.0.1:3000";
const config = JSON.parse(await fs.readFile(process.env.LOCAL_QA_STATUS_FILE, "utf8"));
const api = config.API_URL;
assert.ok(api && ["localhost", "127.0.0.1", "[::1]"].includes(new URL(api).hostname), "Local Supabase required");
const anon = config.PUBLISHABLE_KEY || config.ANON_KEY;
const secret = config.SECRET_KEY || config.SERVICE_ROLE_KEY;
assert.ok(anon && secret, "Disposable local Auth keys required");
const clientOptions = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(api, secret, clientOptions);
const fixtures = [];
const results = [];
const dir = ".qa-results";
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
    await new Promise(r => setTimeout(r, 150));
  }
  throw new Error("Timeout: " + label);
};
const record = (name, width) => results.push({ name, width, status: "PASS" });
const count = async (table, company, extra = {}) => {
  let q = admin.from(table).select("*", { count: "exact", head: true }).eq("company_id", company);
  for (const [key, value] of Object.entries(extra)) q = q.eq(key, value);
  const r = await q;
  if (r.error) throw new Error(r.error.message);
  return r.count;
};
const opp = async (id) => checked(admin.from("opportunities").select("*").eq("id", id).single());
const command = (tenant, payload, requestId = randomUUID()) => tenant.client.rpc("apply_workspace_command", {
  p_company_id: tenant.company, p_request_id: requestId, p_command: payload,
});
const futureInput = () => new Date(Date.now() + 2 * 86400000 - 3 * 3600000).toISOString().slice(0, 16);
const futureISO = () => new Date(Date.now() + 2 * 86400000).toISOString();
async function fixture(label) {
  const email = "qa-" + randomUUID() + "@example.invalid";
  const password = randomBytes(24).toString("base64url");
  const created = await checked(admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: label } }));
  const f = { user: created.user.id, email, password, company: null };
  fixtures.push(f);
  const company = await checked(admin.from("companies").insert({ name: label, company_template: "generic", is_demo: false }).select("id").single());
  f.company = company.id;
  await checked(admin.from("memberships").insert({ company_id: f.company, user_id: f.user, role: "owner" }));
  f.stages = await checked(admin.from("pipeline_stages").insert([
    { company_id: f.company, name: "Novo", position: 0, kind: "open" },
    { company_id: f.company, name: "Negociação", position: 1, kind: "open" },
    { company_id: f.company, name: "Ganho", position: 2, kind: "won" },
    { company_id: f.company, name: "Perdido", position: 3, kind: "lost" },
  ]).select("*"));
  f.client = createClient(api, anon, clientOptions);
  await checked(f.client.auth.signInWithPassword({ email, password }));
  return f;
}
const core = page => page.locator("form.core-form");
async function closeDetails(page) {
  const button = page.getByRole("button", { name: "Fechar detalhes", exact: true });
  if (await button.isVisible()) await button.click();
}
async function createUI(page, title, phone) {
  await closeDetails(page);
  await page.getByRole("button", { name: "Nova oportunidade", exact: true }).click();
  await core(page).getByLabel("Nome do cliente", { exact: false }).fill("QA Cliente fictício");
  await core(page).getByLabel("WhatsApp / telefone", { exact: false }).fill(phone);
  await core(page).getByLabel("Oportunidade", { exact: false }).fill(title);
}
const submit = page => core(page).locator('button[type="submit"]').click();
async function noOverflow(page, scope = "document") {
  const dimensions = await page.evaluate(() => ({
    width: document.documentElement.clientWidth, scroll: document.documentElement.scrollWidth,
  }));
  assert.ok(dimensions.scroll <= dimensions.width + 2, scope + " horizontal overflow");
}
try {
  browser = await chromium.launch({ headless: true });
  for (const width of [360, 390, 412, 768]) {
    const tenant = await fixture("QA Mobile " + width);
    const other = await fixture("QA Isolation " + width);
    const context = await browser.newContext({ viewport: { width, height: width === 768 ? 1024 : 844 } });
    const external = [];
    const errors = [];
    const links = [];
    await context.route("**/*", async route => {
      const url = new URL(route.request().url());
      if (url.hostname === "wa.me") {
        links.push(url.href);
        return route.fulfill({ status: 200, contentType: "text/html", body: "Official deep link intercepted. No message sent." });
      }
      if (["127.0.0.1", "localhost", "[::1]"].includes(url.hostname)) return route.continue();
      external.push(url.hostname);
      return route.abort();
    });
    const page = await context.newPage();
    activePage = page;
    page.on("pageerror", error => errors.push(error.message));
    await page.goto(base + "/login");
    await page.getByLabel("E-mail", { exact: true }).fill(tenant.email);
    await page.getByLabel("Senha", { exact: true }).fill(tenant.password);
    await page.getByRole("button", { name: "Entrar no Aether Flow", exact: true }).click();
    await page.waitForURL(base + "/");
    await page.getByRole("button", { name: "Nova oportunidade", exact: true }).waitFor();
    await noOverflow(page, "authenticated workspace");
    record("real_auth_login", width);

    const title = "QA Núcleo " + width;
    const phone = "+1 202 555 0126";
    await createUI(page, title, "");
    await submit(page);
    assert.equal(await count("contacts", tenant.company), 0);
    await core(page).getByLabel("WhatsApp / telefone", { exact: false }).fill("000");
    await submit(page);
    await core(page).getByRole("alert").waitFor();
    assert.equal(await count("contacts", tenant.company), 0);
    record("missing_and_invalid_phone", width);

    await core(page).getByLabel("WhatsApp / telefone", { exact: false }).fill(phone);
    await noOverflow(page, "capture form");
    const captureStart = Date.now();
    await submit(page);
    await poll("capture persisted", async () => (await count("opportunities", tenant.company)) === 1);
    await page.getByRole("button", { name: "Fechar detalhes", exact: true }).waitFor();
    const first = (await checked(admin.from("opportunities").select("*").eq("company_id", tenant.company)))[0];
    const contact = await checked(admin.from("contacts").select("*").eq("company_id", tenant.company).single());
    assert.equal(contact.phone_normalized, "12025550126");
    assert.equal(contact.phone, "+12025550126");
    results.push({ name: "capture_and_normalized_persistence", width, status: "PASS", automatedSubmitLatencyMs: Date.now() - captureStart, humanCaptureTime: "NOT_MEASURED" });

    await closeDetails(page);
    const snapshotReady = page.waitForResponse(r => r.request().method() === "GET" && new URL(r.url()).pathname === "/api/workspace" && r.ok());
    await page.locator(".priority-row").filter({ hasText: title }).getByRole("button", { name: /Falar com.*no WhatsApp/ }).click();
    await snapshotReady;
    await poll("whatsapp event", async () => (await count("opportunity_history", tenant.company, { opportunity_id: first.id, event: "whatsapp_opened" })) === 1);
    assert.equal((await opp(first.id)).last_interaction_at, null);
    await poll("official link", async () => links.length === 1);
    assert.equal(new URL(links[0]).hostname, "wa.me");
    assert.equal(new URL(links[0]).pathname, "/12025550126");
    await page.locator(".priority-row").filter({ hasText: title }).getByRole("button", { name: "Abrir QA Cliente fictício", exact: true }).click();
    await page.locator(".timeline").getByText("WhatsApp aberto", { exact: true }).waitFor();
    record("whatsapp_open_only_and_snapshot_refresh", width);

    await page.getByRole("button", { name: "Agendar", exact: true }).click();
    await core(page).getByLabel("Próximo passo", { exact: false }).selectOption("Ligação");
    await core(page).getByLabel("Data e horário", { exact: false }).fill(futureInput());
    await submit(page);
    await poll("scheduled", async () => !!(await opp(first.id)).next_action_at);
    await page.getByRole("button", { name: "Concluir ação", exact: true }).click();
    await submit(page);
    assert.equal(await count("activities", tenant.company, { status: "done" }), 0);
    await core(page).getByLabel("Próximo passo", { exact: false }).selectOption("Follow-up");
    await core(page).getByLabel("Data e horário", { exact: false }).fill(futureInput());
    await submit(page);
    await poll("completed_and_next", async () => (await count("activities", tenant.company, { status: "done" })) === 1);
    assert.equal(await count("activities", tenant.company, { status: "pending" }), 1);
    record("complete_requires_next_and_persists_next", width);

    const pending = await checked(admin.from("activities").select("*").eq("company_id", tenant.company).eq("status", "pending").single());
    const historyBefore = await count("opportunity_history", tenant.company);
    const failed = await command(tenant, { kind: "complete", id: first.id, activityId: pending.id, nextStep: { type: "Ligação", dueAt: "invalid-date" } });
    assert.ok(failed.error, "invalid next action must fail");
    assert.equal(await count("activities", tenant.company, { status: "done" }), 1);
    assert.equal(await count("activities", tenant.company, { status: "pending" }), 1);
    assert.equal(await count("opportunity_history", tenant.company), historyBefore);
    record("rollback_next_action_failure", width);

    await page.getByRole("button", { name: "Concluir ação", exact: true }).click();
    await core(page).getByLabel("Próximo passo", { exact: false }).selectOption("close");
    await core(page).getByLabel("Resultado *", { exact: true }).selectOption("lost");
    await core(page).getByLabel("Motivo da perda", { exact: false }).selectOption("Outro");
    await submit(page);
    assert.equal((await opp(first.id)).status, "open");
    await core(page).getByLabel("Descreva o motivo", { exact: false }).fill("QA fictícia: encerramento solicitado");
    await submit(page);
    await poll("lost", async () => (await opp(first.id)).status === "lost");
    assert.equal(await count("activities", tenant.company, { status: "pending" }), 0);
    assert.equal((await opp(first.id)).loss_reason, "Outro");
    record("close_lost_requires_reason_and_clears_pending", width);

    await createUI(page, "QA Reuso " + width, phone);
    await submit(page);
    await core(page).getByText("Este telefone já pertence a QA Cliente fictício.", { exact: true }).waitFor();
    await core(page).getByRole("button", { name: "Criar nova oportunidade para este cliente", exact: true }).click();
    await poll("reuse", async () => (await count("opportunities", tenant.company)) === 2);
    assert.equal(await count("contacts", tenant.company), 1);
    await core(page).waitFor({ state: "hidden" });
    record("explicit_reuse_one_contact_two_opportunities", width);

    const second = (await checked(admin.from("opportunities").select("*").eq("company_id", tenant.company).eq("status", "open")))[0];
    await page.locator(".detail-section select").selectOption(tenant.stages.find(s => s.kind === "won").id);
    await core(page).getByRole("heading", { name: "Encerrar oportunidade", exact: true }).waitFor();
    await submit(page);
    await poll("won", async () => (await opp(second.id)).status === "won");
    assert.equal((await opp(second.id)).next_action_at, null);
    record("close_won_and_history", width);

    await page.reload();
    await page.getByRole("button", { name: "Nova oportunidade", exact: true }).waitFor();
    assert.equal(await count("opportunities", tenant.company), 2);
    await page.getByRole("button", { name: "Nova oportunidade", exact: true }).click();
    await core(page).waitFor();
    await page.keyboard.press("Escape");
    await core(page).waitFor({ state: "hidden" });
    await noOverflow(page, "persisted mobile workspace");
    record("reload_persistence_escape_and_layout", width);

    const foreignRead = await checked(other.client.from("opportunities").select("id").eq("id", first.id));
    assert.deepEqual(foreignRead, []);
    const foreignMutation = await other.client.rpc("apply_workspace_command", { p_company_id: tenant.company, p_request_id: randomUUID(), p_command: { kind: "comment", id: first.id, comment: "FORBIDDEN" } });
    assert.ok(foreignMutation.error);
    const forbiddenDirect = await tenant.client.from("contacts").insert({ company_id: tenant.company, name: "Forbidden", phone: "+12025550127" });
    assert.ok(forbiddenDirect.error);
    record("real_auth_tenant_isolation_and_rest_write_denied", width);

    const concurrentPhone = "+12025550128";
    const createPayload = { kind: "create", contactName: "QA Concorrência", phone: concurrentPhone, title: "QA concorrente", stageId: tenant.stages.find(s => s.kind === "open").id };
    const concurrent = await Promise.all([command(tenant, createPayload), command(tenant, createPayload)]);
    assert.equal(concurrent.filter(r => r.data?.ok).length, 1);
    assert.equal(concurrent.filter(r => r.data?.code === "DUPLICATE_CONTACT").length, 1);
    assert.equal(await count("contacts", tenant.company, { phone_normalized: "12025550128" }), 1);
    record("concurrent_postgrest_contact_uniqueness", width);

    const requestId = randomUUID();
    const reusedPayload = { ...createPayload, phone: "+12025550129", title: "QA idempotente" };
    const repeated = await Promise.all([command(tenant, reusedPayload, requestId), command(tenant, reusedPayload, requestId)]);
    assert.ok(repeated.every(r => r.data?.ok));
    assert.equal(repeated[0].data.id, repeated[1].data.id);
    assert.equal(await count("contacts", tenant.company, { phone_normalized: "12025550129" }), 1);
    record("concurrent_request_id_idempotency", width);

    assert.deepEqual(errors, [], "No uncaught browser errors");
    assert.deepEqual(external, [], "No production/external requests");
    await page.screenshot({ path: dir + "/mobile-" + width + ".png", fullPage: true });
    await context.close();
    activePage = null;
  }
} catch (error) {
  results.push({ name: "failure", status: "FAIL", message: error.message });
  if (activePage) await activePage.screenshot({ path: dir + "/failure.png", fullPage: true }).catch(() => {});
  process.exitCode = 1;
} finally {
  if (browser) await browser.close();
  for (const f of fixtures.reverse()) {
    if (f.company) {
      const r = await admin.from("companies").delete().eq("id", f.company);
      if (r.error) { results.push({ name: "cleanup_company", status: "FAIL", message: r.error.message }); process.exitCode = 1; continue; }
    }
    const r = await admin.auth.admin.deleteUser(f.user);
    if (r.error) { results.push({ name: "cleanup_user", status: "FAIL", message: r.error.message }); process.exitCode = 1; }
  }
  const report = { environment: "DISPOSABLE_LOCAL_SUPABASE_AUTH_POSTGRES_RLS", commit: process.env.TESTED_HEAD_SHA || "LOCAL", productionTested: false, mockAuthentication: false, whatsappSent: false, results };
  await fs.writeFile(dir + "/summary.json", JSON.stringify(report, null, 2));
  console.log(JSON.stringify({ environment: report.environment, passed: results.filter(r => r.status === "PASS").length, failures: results.filter(r => r.status === "FAIL"), productionTested: false }));
}
