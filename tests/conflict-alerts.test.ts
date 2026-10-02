import { test } from "node:test";
import assert from "node:assert/strict";
import { conflictOpportunityIds } from "../lib/conflict-alerts.ts";

test("conflict alerts group pending actions for the same contact and local day", () => {
  const ids = conflictOpportunityIds([
    { id: "a", contact_id: "contact", status: "open", next_action_at: "2026-10-03T12:00:00Z" },
    { id: "b", contact_id: "contact", status: "open", next_action_at: "2026-10-03T19:00:00Z" },
    { id: "c", contact_id: "other", status: "open", next_action_at: "2026-10-03T12:00:00Z" },
  ]);
  assert.deepEqual([...ids].sort(), ["a", "b"]);
});

test("conflict alerts ignore different days and closed opportunities", () => {
  const ids = conflictOpportunityIds([
    { id: "a", contact_id: "contact", status: "open", next_action_at: "2026-10-03T12:00:00Z" },
    { id: "b", contact_id: "contact", status: "open", next_action_at: "2026-10-04T12:00:00Z" },
    { id: "c", contact_id: "contact", status: "won", next_action_at: "2026-10-03T13:00:00Z" },
  ]);
  assert.equal(ids.size, 0);
});
