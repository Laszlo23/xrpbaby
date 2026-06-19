import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  MERCH_BASE_USD_DEFAULT,
  MERCH_EDITION_CAP_DEFAULT,
  MERCH_STEP_USD_DEFAULT,
  formatLadderLine,
  isProductionTargetMet,
  ladderGrossAtCap,
  merchLadderQuote,
  priceUsdForUnitNumber,
  unitsRemaining,
} from "./merch-ladder.ts";

describe("merch-ladder", () => {
  it("first unit is base price", () => {
    assert.equal(priceUsdForUnitNumber(1), MERCH_BASE_USD_DEFAULT);
    assert.equal(priceUsdForUnitNumber(2), MERCH_BASE_USD_DEFAULT + MERCH_STEP_USD_DEFAULT);
  });

  it("unit 77 price", () => {
    const p = priceUsdForUnitNumber(MERCH_EDITION_CAP_DEFAULT);
    assert.equal(p, 66.22);
  });

  it("gross at cap covers production target", () => {
    const gross = ladderGrossAtCap(MERCH_EDITION_CAP_DEFAULT);
    assert.ok(gross >= 2500);
    assert.equal(isProductionTargetMet(MERCH_EDITION_CAP_DEFAULT), true);
  });

  it("units remaining decreases with sold count", () => {
    assert.equal(unitsRemaining(0, 77), 77);
    assert.equal(unitsRemaining(76, 77), 1);
    assert.equal(unitsRemaining(77, 77), 0);
  });

  it("quote for next buyer", () => {
    const q = merchLadderQuote(11, 77);
    assert.ok(q);
    assert.equal(q!.unitNumber, 12);
    assert.equal(q!.priceUsd, priceUsdForUnitNumber(12));
    assert.equal(q!.nextPriceUsd, priceUsdForUnitNumber(13));
    assert.match(formatLadderLine(q!), /#12 of 77/);
  });

  it("sold out returns null quote", () => {
    assert.equal(merchLadderQuote(77, 77), null);
  });
});
