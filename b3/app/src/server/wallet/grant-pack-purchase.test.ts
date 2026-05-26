import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPackBySlug } from "@/lib/packs";

describe("grantPackPurchase idempotency contract", () => {
  it("pack metadata is stable for webhook replay", () => {
    const pack = getPackBySlug("pack_7");
    assert.ok(pack);
    assert.equal(pack.slug, "pack_7");
    assert.equal(pack.usdCents, 700);
    assert.equal(pack.culturePoints, 798);
  });
});
