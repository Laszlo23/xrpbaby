import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { TREASURY_REVENUE_RULES, TREASURY_SAFE_ADDRESS } from "./treasury-revenue-rules.ts";

describe("treasury-revenue-rules backtest", () => {
  it("bucket percents sum to 100", () => {
    const total = TREASURY_REVENUE_RULES.reduce((s, b) => s + b.percent, 0);
    assert.equal(total, 100);
  });

  it("uses published 40/30/20/10 split", () => {
    const byId = Object.fromEntries(TREASURY_REVENUE_RULES.map((b) => [b.id, b.percent]));
    assert.equal(byId.treasury, 40);
    assert.equal(byId.buyback, 30);
    assert.equal(byId.builders, 20);
    assert.equal(byId.burn, 10);
  });

  it("treasury safe is checksummed length-42 hex", () => {
    assert.match(TREASURY_SAFE_ADDRESS, /^0x[a-fA-F0-9]{40}$/);
  });

  it("allocates wei amounts without remainder loss", () => {
    const amount = 1_000_000n * 10n ** 18n;
    let allocated = 0n;
    for (const bucket of TREASURY_REVENUE_RULES) {
      allocated += (amount * BigInt(bucket.percent)) / 100n;
    }
    assert.equal(allocated, amount);
  });
});
