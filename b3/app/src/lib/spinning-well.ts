export const WELL_MAX_DIGIT = 33;
export const WELL_MIN_DIGIT = 1;
export const WELL_TICK_MS = 85;
export const WELL_PASSIVE_MAX = 7;

/** Culture Points for stopped digit d: min(d × 3, 33). */
export function pointsForWellDigit(digit: number): number {
  const d = Math.floor(digit);
  if (d < WELL_MIN_DIGIT) return 0;
  return Math.min(d * 3, 33);
}

export function passiveStopDigit(random = Math.random()): number {
  const r = Math.max(0, Math.min(0.9999, random));
  return 1 + Math.floor(r * WELL_PASSIVE_MAX);
}

export function nextCountdownDigit(current: number): number {
  if (current <= 0) return 0;
  return current - 1;
}

export type CirclePoint = { x: number; y: number };

/** Heuristic: closed loop roughly encircling target center. */
export function isCircleAroundTarget(
  points: readonly CirclePoint[],
  center: CirclePoint,
  opts?: { minRadius?: number; maxRadius?: number },
): boolean {
  if (points.length < 10) return false;

  const minR = opts?.minRadius ?? 28;
  const maxR = opts?.maxRadius ?? 110;

  const distances = points.map((p) => Math.hypot(p.x - center.x, p.y - center.y));
  const avg = distances.reduce((a, b) => a + b, 0) / distances.length;
  if (avg < minR || avg > maxR) return false;

  const variance = distances.reduce((sum, d) => sum + (d - avg) ** 2, 0) / distances.length;
  if (variance > avg * avg * 0.35) return false;

  const first = points[0]!;
  const last = points[points.length - 1]!;
  if (Math.hypot(first.x - last.x, first.y - last.y) > avg * 0.55) return false;

  let pathLen = 0;
  for (let i = 1; i < points.length; i++) {
    const a = points[i - 1]!;
    const b = points[i]!;
    pathLen += Math.hypot(b.x - a.x, b.y - a.y);
  }
  return pathLen >= 2 * Math.PI * avg * 0.55;
}
