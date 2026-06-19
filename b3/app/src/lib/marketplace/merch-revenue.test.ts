import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computeMerchRevenueSplit } from "./merch-revenue.ts";

describe("merch-revenue", () => {
  it("splits 55/25/20 bps to price", () => {
    const split = computeMerchRevenueSplit(100);
    assert.equal(split.productionUsd, 55);
    assert.equal(split.platformUsd, 25);
    assert.equal(split.creatorUsd, 20);
    assert.equal(split.productionBps + split.platformBps + split.creatorBps, 10_000);
  });

  it("rounds split components", () => {
    const split = computeMerchRevenueSplit(16.47);
    assert.equal(split.productionUsd + split.platformUsd + split.creatorUsd, 16.47);
  });
});
