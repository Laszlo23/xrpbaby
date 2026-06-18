import { describe, expect, it } from "vitest";

import { computeProfileGamification } from "@/lib/profile/gamification";

describe("computeProfileGamification", () => {
  it("starts at level 1 with zero inputs", () => {
    const g = computeProfileGamification({});
    expect(g.level).toBe(1);
    expect(g.xp).toBe(0);
    expect(g.progressPercent).toBe(0);
    expect(g.badges.some((b) => b.id === "level")).toBe(true);
  });

  it("awards founding and BCID badges", () => {
    const g = computeProfileGamification({
      isFounding: true,
      hasBcid: true,
      bcidBuilder: 55,
      platformCount: 4,
    });
    expect(g.badges.some((b) => b.id === "founding")).toBe(true);
    expect(g.badges.some((b) => b.id === "bcid")).toBe(true);
    expect(g.badges.some((b) => b.id === "builder")).toBe(true);
    expect(g.badges.some((b) => b.id === "graph")).toBe(true);
    expect(g.level).toBeGreaterThan(1);
  });

  it("progress stays within 0–100", () => {
    const g = computeProfileGamification({
      culturePoints: 5000,
      bcidBuilder: 80,
      credentialCount: 5,
    });
    expect(g.progressPercent).toBeGreaterThanOrEqual(0);
    expect(g.progressPercent).toBeLessThanOrEqual(100);
  });
});
