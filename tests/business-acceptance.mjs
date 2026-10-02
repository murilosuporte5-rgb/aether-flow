import assert from "node:assert/strict";
import { randomBytes, randomUUID } from "node:crypto";
import fs from "node:fs/promises";
import { createClient } from "@supabase/supabase-js";

const config = JSON.parse(await fs.readFile(process.env.LOCAL_QA_STATUS_FILE, "utf8"));
const api = config.API_URL;
const anon = config.PUBLISHABLE_KEY || config.ANON_KEY;
const secret = config.SECRET_KEY || config.SERVICE_ROLE_KEY;
assert.ok(api && anon && secret, "Disposable local Supabase keys required");
const options = { auth: { persistSession: false, autoRefreshToken: false } };
const admin = createClient(api, secret, options);
const checked = async (promise) => { const r = await promise; if (r.error) throw new Error(r.error.message); return r.data; };
const makeUser = async (label) => {
  const email = `qa-${randomUUID()}@example.invalid`;
  const password = randomBytes(24).toString("base64url");
  const user = await checked(admin.auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { full_name: label } }));
  return { id: user.user.id, email, password };
};
const users = [];
const companies = [];
try {
  const operator = await makeUser("QA business operator"); users.push(operator);
  await checked(admin.from("aether_admins").insert({ user_id: operator.id }));
  const customer = await makeUser("QA business customer"); users.push(customer);
  const company = await checked(admin.from("companies").insert({ name: "QA business operations", company_template: "generic" }).select("id").single());
  companies.push(company.id);
  await checked(admin.from("memberships").insert({ company_id: company.id, user_id: customer.id, role: "owner" }));
  const stages = await checked(admin.from("pipeline_stages").insert([
    { company_id: company.id, name: "Novo", position: 0, kind: "open" },
    { company_id: company.id, name: "Ganho", position: 1, kind: "won" },
    { company_id: company.id, name: "Perdido", position: 2, kind: "lost" },
  ]).select("id,kind"));
  const open = stages.find((s) => s.kind === "open").id;
  await checked(admin.from("product_feedback").insert({ company_id: company.id, user_id: customer.id, request_id: randomUUID(), context: "qa", message: "business acceptance" }));

  const operatorClient = createClient(api, anon, options);
  assert.ok((await operatorClient.auth.signInWithPassword({ email: operator.email, password: operator.password })).data.session);
  const catalog = await checked(operatorClient.rpc("admin_customer_catalog"));
  assert.ok(catalog.customers.some((c) => c.id === company.id));
  await checked(operatorClient.rpc("admin_update_company", { p_company_id: company.id, p_action: "extend_trial", p_value: "14" }));
  await checked(operatorClient.rpc("admin_review_feedback", { p_id: catalog.feedback.find((f) => f.company_id === company.id).id, p_state: "reviewed" }));

  const customerClient = createClient(api, anon, options);
  assert.ok((await customerClient.auth.signInWithPassword({ email: customer.email, password: customer.password })).data.session);
  const employee = await makeUser("QA team employee"); users.push(employee);
  const extraUser = await makeUser("QA unauthorized employee"); users.push(extraUser);
  await checked(customerClient.rpc("team_add_member", { p_company_id: company.id, p_user_id: employee.id, p_display_name: "QA team employee", p_role: "member" }));
  const team = await checked(customerClient.rpc("team_catalog", { p_company_id: company.id }));
  assert.ok(team.some((member) => member.user_id === employee.id && member.role === "member"));
  const employeeClient = createClient(api, anon, options);
  assert.ok((await employeeClient.auth.signInWithPassword({ email: employee.email, password: employee.password })).data.session);
  assert.ok((await employeeClient.rpc("team_add_member", { p_company_id: company.id, p_user_id: extraUser.id, p_display_name: "QA unauthorized employee", p_role: "member" })).error);
  await checked(customerClient.rpc("team_set_role", { p_company_id: company.id, p_user_id: employee.id, p_role: "manager" }));
  assert.equal((await checked(customerClient.rpc("team_catalog", { p_company_id: company.id }))).find((member) => member.user_id === employee.id).role, "manager");
  await checked(customerClient.rpc("team_remove_member", { p_company_id: company.id, p_user_id: employee.id }));
  assert.ok(!(await checked(customerClient.rpc("team_catalog", { p_company_id: company.id }))).some((member) => member.user_id === employee.id));
  const requestId = randomUUID();
  const rows = [{ phone: "71999999999", contactName: "Import QA", title: "Importada", stageId: open, dueAt: null }];
  const imported = await checked(customerClient.rpc("import_opportunities", { p_company_id: company.id, p_request_id: requestId, p_rows: rows }));
  assert.equal(imported.imported, 1);
  assert.equal((await checked(customerClient.rpc("import_opportunities", { p_company_id: company.id, p_request_id: requestId, p_rows: rows }))).retry, true);
  assert.equal((await admin.from("opportunities").select("id", { count: "exact", head: true }).eq("company_id", company.id)).count, 1);

  const availabilityRequest = randomUUID();
  const availability = await checked(customerClient.rpc("apply_workspace_command", {
    p_company_id: company.id,
    p_request_id: availabilityRequest,
    p_command: {
      kind: "create",
      contactName: "Availability QA",
      phone: "71999999998",
      title: "Disponibilidade comercial",
      stageId: open,
      value: "250",
      commercialAvailability: "available",
    },
  }));
  assert.equal(availability.ok, true);
  assert.equal((await checked(admin.from("opportunities").select("commercial_availability").eq("id", availability.id).single())).commercial_availability, "available");
  const updateAvailability = async (state) => checked(customerClient.rpc("apply_workspace_command", {
    p_company_id: company.id,
    p_request_id: randomUUID(),
    p_command: {
      kind: "edit",
      id: availability.id,
      contactName: "Availability QA",
      phone: "71999999998",
      title: "Disponibilidade comercial",
      value: "250",
      commercialAvailability: state,
    },
  }));
  await updateAvailability("reserved");
  assert.equal((await checked(admin.from("opportunities").select("commercial_availability").eq("id", availability.id).single())).commercial_availability, "reserved");
  await updateAvailability("consult");
  assert.equal((await checked(admin.from("opportunities").select("commercial_availability").eq("id", availability.id).single())).commercial_availability, "consult");

  await checked(operatorClient.rpc("admin_update_company", { p_company_id: company.id, p_action: "suspend", p_value: "" }));
  assert.ok((await customerClient.rpc("import_opportunities", { p_company_id: company.id, p_request_id: randomUUID(), p_rows: rows })).error);
  await checked(operatorClient.rpc("admin_update_company", { p_company_id: company.id, p_action: "activate", p_value: "" }));
  console.log(JSON.stringify({ status: "PASS", checks: ["admin_catalog", "trial_extension", "feedback_review", "team_owner_manage", "team_member_cannot_manage", "import", "import_retry", "commercial_availability_states", "suspended_write_denied", "reactivation"] }));
} finally {
  for (const company of companies) await admin.from("companies").delete().eq("id", company);
  for (const user of users) await admin.auth.admin.deleteUser(user.id);
}
