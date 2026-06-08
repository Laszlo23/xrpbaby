import { TwitterApi } from "twitter-api-v2";

/** OAuth 1.0a user-context client for Grove's X account (falls back to official X keys). */
export function getGroveTwitterClient(): TwitterApi | null {
  const appKey = process.env.GROVE_X_CONSUMER_KEY?.trim() || process.env.X_CONSUMER_KEY?.trim();
  const appSecret =
    process.env.GROVE_X_CONSUMER_SECRET?.trim() || process.env.X_CONSUMER_SECRET?.trim();
  const accessToken =
    process.env.GROVE_X_ACCESS_TOKEN?.trim() || process.env.X_ACCESS_TOKEN?.trim();
  const accessSecret =
    process.env.GROVE_X_ACCESS_TOKEN_SECRET?.trim() || process.env.X_ACCESS_TOKEN_SECRET?.trim();

  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;

  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });
}

export function groveXConfigured(): boolean {
  return getGroveTwitterClient() !== null;
}

export function groveUsesOfficialXFallback(): boolean {
  const hasGrove =
    Boolean(process.env.GROVE_X_CONSUMER_KEY?.trim()) &&
    Boolean(process.env.GROVE_X_ACCESS_TOKEN?.trim());
  return !hasGrove && groveXConfigured();
}
