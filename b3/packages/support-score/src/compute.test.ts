import { describe, it } from "node:test";
import assert from "node:assert/strict";
import {
  computeSupportScore,
  parseVerifiedAccounts,
  supportRewardMultiplier,
} from "./compute.js";

describe("parseVerifiedAccounts", () => {
  it("maps twitter/x and tiktok", () => {
    const parsed = parseVerifiedAccounts([
      { platform: "twitter", username: "alice" },
      { platform: "x", username: "bob" },
      { platform: "tiktok", username: "carol" },
    ]);
    assert.equal(parsed.length, 3);
    assert.equal(parsed[0]?.platform, "x");
    assert.equal(parsed[2]?.platform, "tiktok");
  });
});

describe("computeSupportScore", () => {
  it("combines neynar score and verified bonuses", () => {
    const score = computeSupportScore({
      neynarScore: 0.8,
      verifiedAccounts: [{ platform: "twitter", username: "alice" }],
      culturePoints: 200,
      isFounding: true,
      completedSocialQuests: 2,
    });
    assert.equal(score, 800 + 150 + 200 + 500 + 50);
  });
});

describe("supportRewardMultiplier", () => {
  it("caps at 1.5 for high scores", () => {
    const mult = supportRewardMultiplier({
      neynarScore: 0.95,
      supportScore: 2000,
    });
    assert.ok(mult >= 1.25);
    assert.ok(mult <= 1.5);
  });
});
