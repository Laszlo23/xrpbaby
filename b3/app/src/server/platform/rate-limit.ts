const WINDOW_MS = 60_000;
const MAX_PER_WINDOW = 30;

const buckets = new Map<string, { count: number; resetAt: number }>();

function prune(): void {
  const now = Date.now();
  for (const [key, bucket] of buckets) {
    if (bucket.resetAt <= now) buckets.delete(key);
  }
}

export function clientIp(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() ?? "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

/** Lightweight in-memory rate limit (per IP + route key). */
export function checkRateLimit(
  request: Request,
  routeKey: string,
  maxPerWindow = MAX_PER_WINDOW,
): { ok: true } | { ok: false; status: number } {
  prune();
  const key = `${routeKey}:${clientIp(request)}`;
  const now = Date.now();
  let bucket = buckets.get(key);
  if (!bucket || bucket.resetAt <= now) {
    bucket = { count: 0, resetAt: now + WINDOW_MS };
    buckets.set(key, bucket);
  }
  bucket.count += 1;
  if (bucket.count > maxPerWindow) {
    return { ok: false, status: 429 };
  }
  return { ok: true };
}

const MAX_BODY_BYTES = 16_384;

export async function readJsonBody(
  request: Request,
  maxBytes = MAX_BODY_BYTES,
): Promise<{ ok: true; body: unknown } | { ok: false; status: number; error: string }> {
  const raw = await request.text();
  if (raw.length > maxBytes) {
    return { ok: false, status: 413, error: "payload_too_large" };
  }
  try {
    return { ok: true, body: JSON.parse(raw) as unknown };
  } catch {
    return { ok: false, status: 400, error: "invalid_json" };
  }
}
