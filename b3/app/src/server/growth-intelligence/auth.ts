import { createHash, timingSafeEqual } from "node:crypto";

export function hashApiKey(key: string): string {
  return createHash("sha256").update(key).digest("hex");
}

export function hashIp(ip: string): string {
  return createHash("sha256").update(ip).digest("hex").slice(0, 32);
}

/** Resolve app slug + API key from ingest request headers. */
export function parseIngestAuth(request: Request): {
  appSlug: string | null;
  apiKey: string | null;
} {
  const auth = request.headers.get("authorization");
  const apiKey = auth?.startsWith("Bearer ") ? auth.slice(7).trim() : null;
  const appSlug =
    request.headers.get("x-gi-app")?.trim() ||
    request.headers.get("x-growth-app")?.trim() ||
    null;
  return { appSlug, apiKey };
}

/** Server-side key lookup: GI_API_KEY_BC_ID → bc-id */
export function envApiKeyForSlug(slug: string): string | undefined {
  const envKey = `GI_API_KEY_${slug.replace(/-/g, "_").toUpperCase()}`;
  return process.env[envKey]?.trim();
}

export function verifyIngestKey(slug: string, apiKey: string | null): boolean {
  if (!apiKey) return false;
  const expected = envApiKeyForSlug(slug);
  if (!expected) return false;
  const a = Buffer.from(hashApiKey(apiKey), "hex");
  const b = Buffer.from(hashApiKey(expected), "hex");
  if (a.length !== b.length) return false;
  return timingSafeEqual(a, b);
}
