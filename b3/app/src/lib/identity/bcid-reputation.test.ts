import { describe, expect, it } from "vitest";

import { computeBcidReputation } from "@/lib/identity/bcid-reputation";

describe("computeBcidReputation", () => {
  it("returns zero scores for empty input", () => {
    const scores = computeBcidReputation({});
    expect(scores.builder).toBe(0);
    expect(scores.trust).toBe(0);
    expect(scores.contribution).toBe(0);
    expect(scores.verification).toBe(0);
  });

  it("does not include social metrics in any score", () => {
    const scores = computeBcidReputation({
      studioProjectCount: 5,
      humanVerified: true,
    });
    expect(scores.builder).toBeGreaterThan(0);
    expect(scores.verification).toBe(25);
  });

  it("caps builder score at 100", () => {
    const scores = computeBcidReputation({
      studioProjectCount: 100,
      deployCount: 100,
      grantMilestoneCount: 100,
      buildTaskCount: 100,
    });
    expect(scores.builder).toBeLessThanOrEqual(100);
  });

  it("adds verification for world id", () => {
    const scores = computeBcidReputation({
      humanVerified: true,
      worldIdVerified: true,
    });
    expect(scores.verification).toBe(60);
  });
});
