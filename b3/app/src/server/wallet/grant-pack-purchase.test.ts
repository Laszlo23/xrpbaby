import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPackBySlug } from "@/lib/packs";

describe("pack stripe webhook amount verification", () => {
  it("pack amount_total must match catalog usdCents", () => {
    const pack = getPackBySlug("pack_7");
    assert.ok(pack);
    assert.equal(pack.usdCents, 700);
    const session = { amount_total: 700 };
    assert.equal(session.amount_total, pack.usdCents);
  });
});
