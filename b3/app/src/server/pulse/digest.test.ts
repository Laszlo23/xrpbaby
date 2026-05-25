import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { canonicalJson, dayIdToUint, dayIdUtc, digestHex } from "./digest";

describe("pulse digest", () => {
  it("canonicalJson is stable for key order", () => {
    const a = canonicalJson({ b: 1, a: 2 });
    const b = canonicalJson({ a: 2, b: 1 });
    assert.equal(a, b);
  });

  it("digestHex is 64 hex chars", () => {
    const d = digestHex({ n: 1 });
    assert.match(d, /^[a-f0-9]{64}$/);
  });

  it("dayIdToUint parses YYYY-MM-DD", () => {
    assert.equal(dayIdToUint("2026-05-23"), 20260523n);
  });

  it("dayIdUtc is ISO date", () => {
    assert.match(dayIdUtc(new Date("2026-05-23T12:00:00Z")), /^\d{4}-\d{2}-\d{2}$/);
  });
});
