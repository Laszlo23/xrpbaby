import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { CULTURE_PACKS, getPackBySlug } from "./packs.ts";

describe("packs", () => {
  it("defines seven tiers", () => {
    assert.equal(CULTURE_PACKS.length, 7);
  });

  it("assigns bonus points above base rate for larger packs", () => {
    const starter = getPackBySlug("pack_07");
    const culture = getPackBySlug("pack_7");
    assert.ok(starter && culture);
    assert.equal(starter.culturePoints, 70);
    assert.ok(culture.culturePoints > culture.usd * 100);
  });

  it("whale pack slug resolves", () => {
    const whale = getPackBySlug("pack_7777777");
    assert.ok(whale);
    assert.equal(whale.usdCents, 777_777_700);
    assert.ok(whale.grantsIdentityMintCredit);
  });
});
