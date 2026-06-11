/** Read first non-empty env var (supports legacy camelCase keys in app/.env). */
export function readXEnv(...keys: string[]): string | undefined {
  for (const key of keys) {
    const value = process.env[key]?.trim();
    if (value) return value;
  }
  return undefined;
}

export function readOfficialXOAuthEnv(): {
  appKey: string;
  appSecret: string;
  accessToken: string;
  accessSecret: string;
} | null {
  const appKey = readXEnv("X_CONSUMER_KEY", "X_consumerKey", "GROVE_X_CONSUMER_KEY");
  const appSecret = readXEnv("X_CONSUMER_SECRET", "X_consumerSecret", "GROVE_X_CONSUMER_SECRET");
  const accessToken = readXEnv("X_ACCESS_TOKEN", "X_accessToken", "GROVE_X_ACCESS_TOKEN");
  const accessSecret = readXEnv(
    "X_ACCESS_TOKEN_SECRET",
    "X_accessTokenSecret",
    "GROVE_X_ACCESS_TOKEN_SECRET",
  );
  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;
  return { appKey, appSecret, accessToken, accessSecret };
}
