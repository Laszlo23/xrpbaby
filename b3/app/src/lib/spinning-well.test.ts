import { describe, expect, it } from "vitest";
import {
  isCircleAroundTarget,
  nextCountdownDigit,
  passiveStopDigit,
  pointsForWellDigit,
  WELL_MAX_DIGIT,
  WELL_PASSIVE_MAX,
} from "@/lib/spinning-well";

describe("spinning-well", () => {
  it("computes points as min(digit × 3, 33)", () => {
    expect(pointsForWellDigit(0)).toBe(0);
    expect(pointsForWellDigit(1)).toBe(3);
    expect(pointsForWellDigit(7)).toBe(21);
    expect(pointsForWellDigit(11)).toBe(33);
    expect(pointsForWellDigit(33)).toBe(33);
  });

  it("passive stop stays in 1..7", () => {
    for (let i = 0; i < 50; i++) {
      const d = passiveStopDigit(i / 50);
      expect(d).toBeGreaterThanOrEqual(1);
      expect(d).toBeLessThanOrEqual(WELL_PASSIVE_MAX);
    }
    expect(passiveStopDigit(0)).toBe(1);
    expect(passiveStopDigit(0.999)).toBe(WELL_PASSIVE_MAX);
  });

  it("countdown decrements toward zero", () => {
    expect(nextCountdownDigit(WELL_MAX_DIGIT)).toBe(32);
    expect(nextCountdownDigit(1)).toBe(0);
    expect(nextCountdownDigit(0)).toBe(0);
  });

  it("circle detection accepts a closed loop around center", () => {
    const center = { x: 100, y: 100 };
    const radius = 60;
    const points = Array.from({ length: 36 }, (_, i) => {
      const a = (i / 36) * 2 * Math.PI;
      return { x: center.x + radius * Math.cos(a), y: center.y + radius * Math.sin(a) };
    });
    expect(isCircleAroundTarget(points, center)).toBe(true);
  });

  it("circle detection rejects sparse strokes", () => {
    const center = { x: 50, y: 50 };
    expect(isCircleAroundTarget([{ x: 10, y: 10 }], center)).toBe(false);
  });
});
