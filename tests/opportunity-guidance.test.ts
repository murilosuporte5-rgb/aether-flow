import test from "node:test";
import assert from "node:assert/strict";
import { momentum, nextBestAction } from "../lib/opportunity-guidance.ts";

const now = Date.parse("2026-10-03T12:00:00Z");

test("next best action is deterministic and explainable", () => {
  assert.deepEqual(nextBestAction({ status: "open", owner_id: null, next_action_at: null }, now)?.action, "Atribuir responsável");
  assert.equal(nextBestAction({ status: "open", owner_id: "u", next_action_at: null }, now)?.action, "Definir próximo passo");
  assert.equal(nextBestAction({ status: "open", owner_id: "u", next_action_at: "2026-10-02T12:00:00Z" }, now)?.action, "Reagendar follow-up");
});

test("momentum exposes only a reasoned label", () => {
  assert.equal(momentum({ status: "open", next_action_at: "2026-10-04T12:00:00Z", last_interaction_at: "2026-10-02T12:00:00Z", stage_entered_at: "2026-10-01T12:00:00Z" }, now).label, "Esquentando");
  assert.equal(momentum({ status: "open", next_action_at: "2026-10-02T12:00:00Z", last_interaction_at: "2026-10-01T12:00:00Z", stage_entered_at: "2026-09-01T12:00:00Z" }, now).label, "Esfriando");
});
