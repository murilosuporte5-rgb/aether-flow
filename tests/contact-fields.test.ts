import assert from "node:assert/strict";
import test from "node:test";
import { fieldKeyFromLabel, validContactFieldValue } from "../lib/contact-fields.ts";

test("contact field keys are stable and safe for database JSON keys", () => {
  assert.equal(fieldKeyFromLabel("Data do contrato"), "data_do_contrato");
  assert.equal(fieldKeyFromLabel("Região / Número"), "regiao_numero");
  assert.equal(fieldKeyFromLabel("<script>"), "script");
});

test("contact field values reject malformed dates, unsafe lengths and invalid numbers", () => {
  assert.equal(validContactFieldValue("date", "2026-02-30"), false);
  assert.equal(validContactFieldValue("date", "2026-12-10"), true);
  assert.equal(validContactFieldValue("number", Number.POSITIVE_INFINITY), false);
  assert.equal(validContactFieldValue("number", 42.5), true);
  assert.equal(validContactFieldValue("text", " "), false);
  assert.equal(validContactFieldValue("text", "Cliente recorrente"), true);
});
