import test from "node:test";
import assert from "node:assert/strict";
import { readAuthHashTokens } from "../lib/auth-recovery.ts";

test("reads Supabase access and refresh tokens from an auth fragment", () => {
  assert.deepEqual(
    readAuthHashTokens("#access_token=access%2Bvalue&refresh_token=refresh%2Fvalue&type=recovery"),
    { accessToken: "access+value", refreshToken: "refresh/value" },
  );
});

test("does not enable a session when either auth token is missing", () => {
  assert.equal(readAuthHashTokens("#access_token=only-access"), null);
  assert.equal(readAuthHashTokens(""), null);
});
