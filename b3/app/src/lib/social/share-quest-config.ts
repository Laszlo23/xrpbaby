import { getPublicAppOrigin } from "@/lib/app-origin";
import { warpcastComposeUrl, twitterIntentUrl } from "@/lib/campaign-share";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export function farcasterTagHandle(): string {
  const raw =
    (typeof import.meta.env.VITE_SOCIAL_FC_HANDLE === "string"
      ? import.meta.env.VITE_SOCIAL_FC_HANDLE
      : "") || "0xleonardo";
  return raw.replace(/^@/, "");
}

export function xTagHandles(): string[] {
  const raw =
    (typeof import.meta.env.VITE_SOCIAL_X_HANDLES === "string"
      ? import.meta.env.VITE_SOCIAL_X_HANDLES
      : "") || "bihary41418,buildingcultu3";
  return raw
    .split(",")
    .map((h) => h.trim().replace(/^@/, ""))
    .filter(Boolean);
}

export function shareStoryComposeText(platform: "farcaster" | "x"): string {
  const origin = getPublicAppOrigin();
  const fc = farcasterTagHandle();
  const xTags = xTagHandles()
    .map((h) => `@${h}`)
    .join(" ");

  if (platform === "farcaster") {
    return `Building culture, not just farming attention. @${fc} ${BRAND_DISPLAY_NAME} ${origin} #BuildCulture`;
  }
  return `${BRAND_DISPLAY_NAME} — verifiable culture onchain. ${xTags} @${fc} ${origin} #BuildCulture`;
}

export function farcasterShareComposeUrl(): string {
  return warpcastComposeUrl(shareStoryComposeText("farcaster"));
}

export function xShareComposeUrl(): string {
  const origin = getPublicAppOrigin();
  return twitterIntentUrl(shareStoryComposeText("x"), origin);
}

export const EFFORT_TIER_HINT =
  "Quote posts earn more Culture Value than reposts. Tag us and add the app link for bonuses.";

export type SocialShareBreakdownDisplay = {
  cultureValue: number;
  actionType: string;
  breakdown: {
    base: number;
    mentions: number;
    link: number;
    hashtag: number;
    length: number;
    media: number;
    agentBonus: number;
  };
  agentScored?: boolean;
};
