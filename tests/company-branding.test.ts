import assert from "node:assert/strict";
import test from "node:test";
import { brandColorOrDefault, brandColors, defaultBrandColor, isBrandColor } from "../lib/company-branding.ts";

test("company branding accepts only supported accessible palette values", () => {
  for (const color of brandColors) assert.equal(isBrandColor(color.value), true);
  for (const value of ["#ffffff", "red", "var(--secret)", "#2457a5; background:url(x)", null]) {
    assert.equal(isBrandColor(value), false);
    assert.equal(brandColorOrDefault(value), defaultBrandColor);
  }
});
