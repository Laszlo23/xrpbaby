import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  applyPowerMultiplier,
  baseActivationBps,
  computeCulturePower,
  computeEffectiveMultiplierBps,
  daysSinceMaintenance,
  lpTierFromBalanceWei,
  MS_PER_UTC_DAY,
  powerScoreFromMultiplierBps,
  streakMultiplierBps,
} from "./culture-power.ts";

describe("culture-power", () => {
  const now = Date.UTC(2026, 5, 18, 12, 0, 0);

  it("activation is full when maintained today", () => {
    assert.equal(baseActivationBps(0, 400), 10_000);
  });

  it("activation decays per idle day", () => {
    assert.equal(baseActivationBps(1, 1000), 9500);
    assert.equal(baseActivationBps(3, 1000), 8500);
  });

  it("streak caps at 7 days", () => {
    assert.equal(streakMultiplierBps(7), 11_400);
    assert.equal(streakMultiplierBps(10), 11_400);
  });

  it("multiplier stays within bounds", () => {
    const bps = computeEffectiveMultiplierBps({
      nowMs: now,
      lastMaintenanceMs: now - 60_000,
      peakScore7d: 800,
      streakDays: 7,
      stakePoolId: 2,
      lpTier: 2,
      burnTier: 2,
    });
    assert.ok(bps >= 8000);
    assert.ok(bps <= 20_000);
  });

  it("idle user gets lower multiplier than active staker", () => {
    const idle = computeCulturePower({
      nowMs: now,
      lastMaintenanceMs: now - 5 * 24 * 60 * 60 * 1000,
      peakScore7d: 500,
      streakDays: 0,
      stakePoolId: 0,
      lpTier: 0,
      burnTier: 0,
    });
    const active = computeCulturePower({
      nowMs: now,
      lastMaintenanceMs: now,
      peakScore7d: 500,
      streakDays: 5,
      stakePoolId: 2,
      lpTier: 2,
      burnTier: 1,
    });
    assert.ok(active.effectiveMultiplierBps > idle.effectiveMultiplierBps);
  });

  it("applyPowerMultiplier scales wei", () => {
    const base = 1_000_000_000_000_000_000n;
    assert.equal(applyPowerMultiplier(base, 12_500), (base * 12_500n) / 10_000n);
  });

  it("lp tiers from balance", () => {
    assert.equal(lpTierFromBalanceWei(0n), 0);
    assert.equal(lpTierFromBalanceWei(2_000_000_000_000_000n), 1);
    assert.equal(lpTierFromBalanceWei(20_000_000_000_000_000n), 2);
  });

  it("daysSinceMaintenance uses UTC days", () => {
    const last = Date.UTC(2026, 5, 18, 10, 0, 0);
    assert.equal(daysSinceMaintenance(last, now), 0);
    assert.equal(daysSinceMaintenance(last - MS_PER_UTC_DAY, now), 1);
  });

  it("power score maps multiplier range to 0-1000", () => {
    assert.equal(powerScoreFromMultiplierBps(8000), 0);
    assert.equal(powerScoreFromMultiplierBps(20_000), 1000);
  });
});
