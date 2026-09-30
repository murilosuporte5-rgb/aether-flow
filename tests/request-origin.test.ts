import test from "node:test";
import assert from "node:assert/strict";
import { isRequestOriginAllowed } from "../lib/request-origin.ts";

test("Railway public origin is accepted independently of internal request URL", () => {
  assert.equal(isRequestOriginAllowed("https://flow.example.com", "http://localhost:3000/api/workspace", "flow.example.com"), true);
});
test("configured deployment rejects attacker, internal, different scheme and port origins", () => {
  for (const origin of ["https://attacker.example", "http://localhost:3000", "http://flow.example.com", "https://flow.example.com:444", "https://flow.example.com.attacker.example", "https://flow.example.com/", "null", "invalid"]) {
    assert.equal(isRequestOriginAllowed(origin, "https://attacker.example/api/workspace", "flow.example.com"), false, origin);
  }
});
test("local runtime uses request origin and absent origin still requires route authentication", () => {
  assert.equal(isRequestOriginAllowed("http://localhost:3000", "http://localhost:3000/api/workspace"), true);
  assert.equal(isRequestOriginAllowed("https://attacker.example", "http://localhost:3000/api/workspace"), false);
  assert.equal(isRequestOriginAllowed(null, "http://localhost:3000/api/workspace", "flow.example.com"), true);
});
