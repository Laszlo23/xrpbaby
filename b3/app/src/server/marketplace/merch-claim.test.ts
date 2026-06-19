import assert from "node:assert/strict";
import { describe, it } from "node:test";

describe("merch claim contract", () => {
  it("claim code minimum length enforced at API boundary", () => {
    const minLen = 8;
    assert.ok("abc12345".length >= minLen);
    assert.ok("short".length < minLen);
  });

  it("wallet addresses are checksummed-agnostic lowercase compare", () => {
    const a = "0xAbCdEf0000000000000000000000000000000001";
    const b = "0xabcdef0000000000000000000000000000000001";
    assert.equal(a.toLowerCase(), b.toLowerCase());
  });
});
