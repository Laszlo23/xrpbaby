import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { computePanicSecretBonusWei } from "./panic-onchain-bonus.ts";

describe("computePanicSecretBonusWei", () => {
  it("increases with streak and hold", () => {
    const low = computePanicSecretBonusWei({
      streakDays: 1,
      holdSeconds: 60,
      totalRuns: 1,
      precisionScore: 500,
    });
    const high = computePanicSecretBonusWei({
      streakDays: 10,
      holdSeconds: 3600,
      totalRuns: 10,
      precisionScore: 720,
    });
    assert.ok(high > low);
  });

  it("respects cap", () => {
    const bonus = computePanicSecretBonusWei({
      streakDays: 90,
      holdSeconds: 5220,
      totalRuns: 120,
      precisionScore: 777,
    });
    assert.ok(bonus <= 250_000_000_000_000_000n);
  });
});
