export const MINI_APP_ORIGIN = (
  import.meta.env.VITE_MINI_APP_ORIGIN?.replace(/\/$/, "") ||
  "https://mini.buildingcultureid.space"
).trim();

export const MINI_APP_HOST = new URL(MINI_APP_ORIGIN).hostname;

/** FID for @buildingcultu3 — set in .env for follow quest */
export const OFFICIAL_FARCASTER_FID = Number(
  import.meta.env.VITE_FARCASTER_ACCOUNT_FID || "0",
);

export const QUEST_HASHTAG =
  import.meta.env.VITE_QUEST_HASHTAG?.trim() || "BuildingCulture";

export function miniAppUrl(path = "/"): string {
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${MINI_APP_ORIGIN}${normalized}`;
}

export function isMiniAppHost(hostname: string): boolean {
  return hostname === MINI_APP_HOST;
}
