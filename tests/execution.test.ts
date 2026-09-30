import test from "node:test";
import assert from "node:assert/strict";
import {
  normalizePhone,
  phoneForStorage,
  formatPhone,
  whatsappUrl,
  daysSinceInteraction,
  priorityRank,
  comparePriority,
  messageTemplate,
} from "../lib/execution.ts";

test("accepts all requested Brazilian formats without inventing DDD", () => {
  for (const value of [
    "71999999999",
    "(71) 99999-9999",
    "+55 71 99999-9999",
    "5571999999999",
  ])
    assert.equal(normalizePhone(value), "5571999999999");
  assert.equal(normalizePhone("(11) 3456-7890"), "551134567890");
  assert.equal(formatPhone("5571999999999"), "(71) 99999-9999");
});
test("rejects missing, short, invalid DDD, invalid mobile and alphabetic phones", () => {
  for (const value of [
    null,
    "",
    "99999-9999",
    "00000000000",
    "(20) 99999-9999",
    "(71) 89999-9999",
    "(71) 1999-9999",
    "abc71999999999",
  ])
    assert.equal(normalizePhone(value), null, String(value));
});
test("explicit international phone remains international", () => {
  assert.equal(normalizePhone("+1 415 555 2671"), "14155552671");
  assert.equal(normalizePhone("14155552671"), null);
});
test("WhatsApp links use only official wa.me, encode editable message, and reject no phone", () => {
  assert.equal(whatsappUrl(null), null);
  assert.equal(whatsappUrl("invalid"), null);
  assert.equal(
    whatsappUrl("71999999999", "Olá, João!"),
    "https://wa.me/5571999999999?text=Ol%C3%A1%2C%20Jo%C3%A3o!",
  );
  assert.match(messageTemplate("João Silva", "Cozinha"), /^Olá, João\./);
});
test("stale uses only recorded interaction; missing is unknown; future clamps zero", () => {
  const now = Date.parse("2026-09-30T12:00:00Z");
  assert.equal(daysSinceInteraction("2026-09-23T12:00:00Z", now), 7);
  assert.equal(daysSinceInteraction("2026-09-27T12:01:00Z", now), 2);
  assert.equal(daysSinceInteraction(null, now), null);
  assert.equal(daysSinceInteraction("bad", now), null);
  assert.equal(daysSinceInteraction("2026-10-01T12:00:00Z", now), 0);
});
test("priority is overdue, today, missing, stale, waiting, future; won/lost last", () => {
  const now = Date.parse("2026-09-30T12:00:00Z");
  const base = {
    id: "x",
    status: "open",
    next_action_at: "2026-10-02T12:00:00Z",
    next_action_type: "WhatsApp",
    last_interaction_at: "2026-09-30T11:00:00Z",
    created_at: "2026-09-20T12:00:00Z",
  };
  const rows = [
    { ...base, id: "future" },
    { ...base, id: "waiting", next_action_type: "Aguardar cliente" },
    { ...base, id: "stale", last_interaction_at: "2026-09-23T12:00:00Z" },
    { ...base, id: "missing", next_action_at: null },
    { ...base, id: "today", next_action_at: "2026-09-30T16:00:00Z" },
    { ...base, id: "overdue", next_action_at: "2026-09-30T11:00:00Z" },
    { ...base, id: "won", status: "won" },
  ];
  assert.deepEqual(
    rows.map((r) => priorityRank(r, now)),
    [5, 4, 3, 2, 1, 0, 6],
  );
  assert.deepEqual(
    rows.sort((a, b) => comparePriority(a, b, now)).map((r) => r.id),
    ["overdue", "today", "missing", "stale", "waiting", "future", "won"],
  );
});
test("same deadline priority has deterministic stable ID tie-breaker", () => {
  const base = {
    status: "open",
    next_action_at: null,
    next_action_type: null,
    last_interaction_at: null,
    created_at: "2026-09-30T12:00:00Z",
  };
  assert.ok(comparePriority({ ...base, id: "a" }, { ...base, id: "b" }) < 0);
});

test("phone storage round-trip preserves country and normalized identity", () => {
  for (const input of [
    "71999999999",
    "(71) 99999-9999",
    "+55 71 99999-9999",
    "+1 415 555 2671",
  ]) {
    const stored = phoneForStorage(input);
    assert.ok(stored?.startsWith("+"));
    assert.equal(normalizePhone(stored), normalizePhone(input));
    assert.ok(whatsappUrl(stored));
  }
  assert.equal(phoneForStorage("999999999"), null);
});
