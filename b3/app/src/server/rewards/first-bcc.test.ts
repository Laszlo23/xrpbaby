import assert from "node:assert/strict";
import { describe, it } from "node:test";

/** Mirrored from first-bcc.ts for backtest without treasury side effects. */
function onboardingBccGrantWei(): bigint {
  const raw = process.env.ONBOARDING_BCC_GRANT_WEI?.trim();
  if (raw && /^\d+$/.test(raw)) return BigInt(raw);
  return 10n * 10n ** 18n;
}

function pointsToBccWei(points: number, pointsPerBccWei: bigint): bigint {
  if (points <= 0 || pointsPerBccWei <= 0n) return 0n;
  return BigInt(points) * pointsPerBccWei;
}

describe("first-bcc backtest", () => {
  it("default onboarding grant is 10 BCC in wei", () => {
    const prev = process.env.ONBOARDING_BCC_GRANT_WEI;
    delete process.env.ONBOARDING_BCC_GRANT_WEI;
    assert.equal(onboardingBccGrantWei(), 10n * 10n ** 18n);
    if (prev !== undefined) process.env.ONBOARDING_BCC_GRANT_WEI = prev;
  });

  it("respects ONBOARDING_BCC_GRANT_WEI override", () => {
    const prev = process.env.ONBOARDING_BCC_GRANT_WEI;
    process.env.ONBOARDING_BCC_GRANT_WEI = "5000000000000000000";
    assert.equal(onboardingBccGrantWei(), 5n * 10n ** 18n);
    if (prev !== undefined) process.env.ONBOARDING_BCC_GRANT_WEI = prev;
    else delete process.env.ONBOARDING_BCC_GRANT_WEI;
  });
});

describe("points redeem backtest", () => {
  it("pointsToBccWei multiplies correctly", () => {
    const rate = 1_000_000_000_000_000_000n;
    assert.equal(pointsToBccWei(10, rate), 10n * rate);
  });

  it("returns zero for non-positive points", () => {
    assert.equal(pointsToBccWei(0, 1n), 0n);
    assert.equal(pointsToBccWei(-1, 1n), 0n);
  });
});
