/** Public community URLs — used when env vars are unset so campaigns work out of the box. */
export const DEFAULT_COMMUNITY_X_URL = "https://x.com/buildingcultu3";
export const DEFAULT_COMMUNITY_TELEGRAM_URL = "https://t.me/+4zFH7-2tyW0yOTBk";
export const DEFAULT_FARCASTER_PROFILE_URL = "https://farcaster.xyz/0xleonardo";

export function communityXUrl(): string {
  const v =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_COMMUNITY_X_URL?.trim()) || "";
  return v || DEFAULT_COMMUNITY_X_URL;
}

export function communityTelegramUrl(): string {
  const v =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_COMMUNITY_TELEGRAM_URL?.trim()) ||
    "";
  return v || DEFAULT_COMMUNITY_TELEGRAM_URL;
}

export function farcasterFollowProfileUrl(): string {
  const v =
    (typeof import.meta !== "undefined" && import.meta.env?.VITE_FARCASTER_FOLLOW_URL?.trim()) ||
    "";
  return v || DEFAULT_FARCASTER_PROFILE_URL;
}
