import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  IDENTITY_MINT_CAP_USD,
  IDENTITY_MINT_TIER_SIZE,
  culturePointsForMint,
  ladderSummary,
  tierIndexForTotalMinted,
  usdPriceForTier,
  usdPriceForTotalMinted,
  weiForUsdPrice,
} from "./mint-ladder.ts";

describe("mint-ladder", () => {
  it("tier 0 for first 77 mints", () => {
    assert.equal(tierIndexForTotalMinted(0), 0);
    assert.equal(tierIndexForTotalMinted(11), 0);
    assert.equal(tierIndexForTotalMinted(76), 0);
    assert.equal(usdPriceForTotalMinted(11), 0.07);
  });

  it("tier 1 starts at mint 78", () => {
    assert.equal(tierIndexForTotalMinted(77), 1);
    assert.equal(usdPriceForTier(1), 0.56);
  });

  it("caps at 7.77", () => {
    assert.equal(usdPriceForTier(100), IDENTITY_MINT_CAP_USD);
  });

  it("ladder summary mints left", () => {
    const s = ladderSummary(11);
    assert.equal(s.mintsLeftInTier, 66);
    assert.equal(s.tierUsd, 0.07);
    assert.equal(s.nextMintNumber, 12);
  });

  it("early mint bonus points", () => {
    assert.equal(culturePointsForMint(11), 84);
    assert.equal(culturePointsForMint(77), 77);
  });

  it("wei conversion", () => {
    const wei = weiForUsdPrice(0.07, 3000);
    assert.ok(wei > 0n);
  });
});
