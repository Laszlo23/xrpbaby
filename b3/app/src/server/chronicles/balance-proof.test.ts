import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { parseChronicleEditionTaskSlug } from "./balance-proof.ts";

describe("parseChronicleEditionTaskSlug", () => {
  it("parses valid edition slugs", () => {
    assert.equal(parseChronicleEditionTaskSlug("chronicle-mint-edition-1"), 1);
    assert.equal(parseChronicleEditionTaskSlug("chronicle-mint-edition-11"), 11);
  });

  it("rejects invalid slugs", () => {
    assert.equal(parseChronicleEditionTaskSlug("chronicle-founder-complete"), undefined);
    assert.equal(parseChronicleEditionTaskSlug("chronicle-mint-edition-0"), undefined);
    assert.equal(parseChronicleEditionTaskSlug("chronicle-mint-edition-12"), undefined);
  });
});
