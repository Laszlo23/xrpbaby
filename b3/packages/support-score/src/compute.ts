export type SocialPlatform = "farcaster" | "x" | "tiktok" | "github";

export type VerifiedAccountInput = {
  platform: string;
  username: string;
};

export type SupportScoreInput = {
  neynarScore?: number | null;
  verifiedAccounts?: VerifiedAccountInput[];
  culturePoints?: number;
  isFounding?: boolean;
  completedSocialQuests?: number;
};

export type ParsedVerifiedSocial = {
  platform: SocialPlatform;
  handle: string;
};

const VERIFIED_PLATFORM_BONUS = 150;
const CULTURE_POINTS_CAP = 500;
const FOUNDING_BONUS = 500;
const ENGAGEMENT_QUEST_POINTS = 25;

/** Map Neynar / Farcaster verified account platform strings to canonical platforms. */
export function parseVerifiedAccounts(
  accounts: VerifiedAccountInput[] | undefined,
): ParsedVerifiedSocial[] {
  if (!accounts?.length) return [];
  const out: ParsedVerifiedSocial[] = [];
  for (const acct of accounts) {
    const platform = acct.platform.toLowerCase();
    const handle = acct.username.trim();
    if (!handle) continue;
    if (platform.includes("twitter") || platform === "x") {
      out.push({ platform: "x", handle });
    } else if (platform.includes("tiktok")) {
      out.push({ platform: "tiktok", handle });
    } else if (platform.includes("github")) {
      out.push({ platform: "github", handle });
    }
  }
  return out;
}

/** Unified support score (0–~3000+). Higher = more credible community supporter. */
export function computeSupportScore(input: SupportScoreInput): number {
  let score = 0;

  if (input.neynarScore != null && Number.isFinite(input.neynarScore)) {
    score += Math.round(Math.max(0, Math.min(1, input.neynarScore)) * 1000);
  }

  const verified = parseVerifiedAccounts(input.verifiedAccounts);
  score += verified.length * VERIFIED_PLATFORM_BONUS;

  if (input.culturePoints != null && input.culturePoints > 0) {
    score += Math.min(input.culturePoints, CULTURE_POINTS_CAP);
  }

  if (input.isFounding) {
    score += FOUNDING_BONUS;
  }

  if (input.completedSocialQuests != null && input.completedSocialQuests > 0) {
    score += input.completedSocialQuests * ENGAGEMENT_QUEST_POINTS;
  }

  return score;
}

/** Reward multiplier when supporting a high-quality member (1.0–1.5). */
export function supportRewardMultiplier(input: {
  neynarScore?: number | null;
  supportScore?: number | null;
  minNeynarScore?: number;
  minSupportScore?: number;
}): number {
  const minNeynar = input.minNeynarScore ?? 0.5;
  const minSupport = input.minSupportScore ?? 750;
  let mult = 1;

  if (input.neynarScore != null && input.neynarScore >= minNeynar) {
    mult += 0.25 * Math.min(1, (input.neynarScore - minNeynar) / (1 - minNeynar || 1));
  }
  if (input.supportScore != null && input.supportScore >= minSupport) {
    mult += 0.25 * Math.min(1, (input.supportScore - minSupport) / minSupport);
  }

  return Math.min(1.5, Math.round(mult * 100) / 100);
}

/** Extract Neynar user quality score from API user object (field name varies). */
export function extractNeynarScore(user: Record<string, unknown>): number | null {
  const experimental = user.experimental as Record<string, unknown> | undefined;
  const candidates = [
    user.score,
    user.neynar_user_score,
    experimental?.neynar_user_score,
    experimental?.user_score,
  ];
  for (const raw of candidates) {
    if (typeof raw === "number" && Number.isFinite(raw)) {
      return raw >= 0 && raw <= 1 ? raw : raw > 1 ? raw / 100 : null;
    }
  }
  return null;
}

/** Map Neynar verified_accounts to our input shape. */
export function neynarVerifiedAccounts(
  user: Record<string, unknown>,
): VerifiedAccountInput[] {
  const list = user.verified_accounts as Array<Record<string, unknown>> | undefined;
  if (!Array.isArray(list)) return [];
  return list
    .map((row) => ({
      platform: String(row.platform ?? ""),
      username: String(row.username ?? ""),
    }))
    .filter((row) => row.platform && row.username);
}
