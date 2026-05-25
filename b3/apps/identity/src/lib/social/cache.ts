const store = new Map<string, { expires: number; value: unknown }>();

const DEFAULT_TTL_MS = 10 * 60 * 1000;

export async function withCache<T>(
  key: string,
  fn: () => Promise<T>,
  ttlMs = DEFAULT_TTL_MS,
): Promise<T> {
  const now = Date.now();
  const hit = store.get(key);
  if (hit && hit.expires > now) {
    return hit.value as T;
  }
  const value = await fn();
  store.set(key, { expires: now + ttlMs, value });
  return value;
}
