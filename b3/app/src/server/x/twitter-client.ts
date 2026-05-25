import { TwitterApi } from "twitter-api-v2";

/** OAuth 1.0a user-context client for X API v2 (read + manage tweets). */
export function getTwitterUserClient(): TwitterApi | null {
  const appKey = process.env.X_CONSUMER_KEY?.trim();
  const appSecret = process.env.X_CONSUMER_SECRET?.trim();
  const accessToken = process.env.X_ACCESS_TOKEN?.trim();
  const accessSecret = process.env.X_ACCESS_TOKEN_SECRET?.trim();
  if (!appKey || !appSecret || !accessToken || !accessSecret) return null;
  return new TwitterApi({
    appKey,
    appSecret,
    accessToken,
    accessSecret,
  });
}
