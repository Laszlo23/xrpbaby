import { TwitterApi } from "twitter-api-v2";

import { readOfficialXOAuthEnv, readXEnv } from "@/server/x/x-env";

/** OAuth 1.0a user-context client for Grove's X account (falls back to official X keys). */
export function getGroveTwitterClient(): TwitterApi | null {
  const appKey = readXEnv("GROVE_X_CONSUMER_KEY") || readOfficialXOAuthEnv()?.appKey;
  const appSecret = readXEnv("GROVE_X_CONSUMER_SECRET") || readOfficialXOAuthEnv()?.appSecret;
  const accessToken = readXEnv("GROVE_X_ACCESS_TOKEN") || readOfficialXOAuthEnv()?.accessToken;
  const accessSecret =
    readXEnv("GROVE_X_ACCESS_TOKEN_SECRET") || readOfficialXOAuthEnv()?.accessSecret;

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
    Boolean(readXEnv("GROVE_X_CONSUMER_KEY")) && Boolean(readXEnv("GROVE_X_ACCESS_TOKEN"));
  return !hasGrove && groveXConfigured();
}
