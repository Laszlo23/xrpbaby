/** Best-effort fixed-window limiter (per server instance). */

const buckets = new Map<string, { n: number; reset: number }>();

export function rateLimitOk(key: string, max: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);
  if (!b || now > b.reset) {
    buckets.set(key, { n: 1, reset: now + windowMs });
    return true;
  }
  if (b.n >= max) return false;
  b.n += 1;
  return true;
}
