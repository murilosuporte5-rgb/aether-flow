import test from "node:test";
import assert from "node:assert/strict";
import { consumeRateLimit } from "../lib/rate-limit.ts";

test("rate limit allows the configured window and reports retry time", () => {
  const key = `test-${Math.random()}`;
  assert.equal(consumeRateLimit(key, 2, 1000, 10_000).allowed, true);
  assert.equal(consumeRateLimit(key, 2, 1000, 10_100).allowed, true);
  const blocked = consumeRateLimit(key, 2, 1000, 10_200);
  assert.equal(blocked.allowed, false);
  assert.equal(blocked.retryAfterSeconds, 1);
  assert.equal(consumeRateLimit(key, 2, 1000, 11_001).allowed, true);
});
