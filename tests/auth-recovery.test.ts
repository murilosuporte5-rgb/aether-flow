import test from "node:test";
import assert from "node:assert/strict";
import { readAuthHashError, readAuthHashTokens } from "../lib/auth-recovery.ts";

test("explains expired recovery links from the auth fragment", () => {
  assert.equal(
    readAuthHashError("#error=access_denied&error_code=otp_expired&error_description=Link+expired"),
    "Link de recuperação inválido ou expirado. Solicite outro.",
  );
  assert.equal(readAuthHashError("#access_token=ok&refresh_token=ok"), null);
});

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
