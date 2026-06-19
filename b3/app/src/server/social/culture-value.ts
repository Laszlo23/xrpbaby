/** Effort-based Culture Value scoring for social share quests. */

export const CULTURE_VALUE_CAP = 200;

export type ShareActionType =
  | "follow"
  | "like"
  | "recast"
  | "repost"
  | "quote"
  | "reply"
  | "original";

export type CultureValueBreakdown = {
  base: number;
  mentions: number;
  link: number;
  hashtag: number;
  length: number;
  media: number;
  agentBonus: number;
};

export type CultureValueInput = {
  actionType: ShareActionType;
  text: string;
  mentionsOk: boolean;
  hasAppLink: boolean;
  hasHashtag: boolean;
  hasMedia: boolean;
  agentBonus?: number;
};

const BASE_POINTS: Record<ShareActionType, number> = {
  follow: 35,
  like: 25,
  recast: 35,
  repost: 35,
  quote: 50,
  reply: 30,
  original: 75,
};

/** X originals score slightly higher than Farcaster originals at base. */
export function basePointsForAction(
  actionType: ShareActionType,
  platform: "farcaster" | "x",
): number {
  if (actionType === "original" && platform === "x") return 80;
  if (actionType === "original" && platform === "farcaster") return 70;
  return BASE_POINTS[actionType];
}

export function computeCultureValue(
  input: CultureValueInput,
  platform: "farcaster" | "x",
): { cultureValue: number; breakdown: CultureValueBreakdown } {
  const breakdown: CultureValueBreakdown = {
    base: basePointsForAction(input.actionType, platform),
    mentions: 0,
    link: 0,
    hashtag: 0,
    length: 0,
    media: 0,
    agentBonus: 0,
  };

  if (input.mentionsOk) breakdown.mentions = 15;
  if (input.hasAppLink) breakdown.link = 10;
  if (input.hasHashtag) breakdown.hashtag = 5;

  const isSubstantive =
    input.actionType === "original" || input.actionType === "quote" || input.actionType === "reply";
  if (isSubstantive && input.text.trim().length >= 120) breakdown.length = 10;
  if (input.hasMedia) breakdown.media = 15;

  if (input.agentBonus != null && input.agentBonus > 0) {
    breakdown.agentBonus = Math.min(40, Math.round(input.agentBonus));
  }

  const raw =
    breakdown.base +
    breakdown.mentions +
    breakdown.link +
    breakdown.hashtag +
    breakdown.length +
    breakdown.media +
    breakdown.agentBonus;

  return {
    cultureValue: Math.min(CULTURE_VALUE_CAP, raw),
    breakdown,
  };
}

export function effortTierLabel(actionType: ShareActionType): string {
  switch (actionType) {
    case "recast":
    case "repost":
      return "Recast / Repost";
    case "quote":
      return "Quote post";
    case "reply":
      return "Reply";
    case "original":
      return "Original post";
    case "follow":
      return "Follow";
    case "like":
      return "Like";
    default: {
      const _exhaustive: never = actionType;
      return _exhaustive;
    }
  }
}
