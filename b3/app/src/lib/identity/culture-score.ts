import type {
  CultureScoreDimension,
  CultureScoreRank,
} from "@/lib/profile/founder-showcase";
import type { CultureIdentityGraph } from "@/lib/identity/identity-graph-types";
import type { ResolvedCultureName } from "@/lib/identity/resolve-types";
import type { MemberProfileBridge } from "@/lib/identity/identity-graph-types";

export type ComputedCultureScore = {
  score: number;
  note: string;
  rank: CultureScoreRank;
  dimensions: CultureScoreDimension[];
};

export type CultureScoreInput = {
  resolved: ResolvedCultureName;
  graph: CultureIdentityGraph | null;
  nftCount?: number;
  txCount?: number;
  member?: MemberProfileBridge | null;
  /** Active BC-issued credentials count (weighted by tier in reputation formula). */
  credentialCount?: number;
  /** Web3.bio isHuman or Verified Human credential. */
  humanVerified?: boolean;
  /** Web3.bio isSpam / isRisky flags reduce leaderboard eligibility. */
  isRisky?: boolean;
};

const SOCIAL_PLATFORMS = new Set(["farcaster", "lens", "twitter"]);

function clampPercent(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

function maxSocialFollowers(graph: CultureIdentityGraph | null): number {
  if (!graph) return 0;
  let max = 0;
  for (const node of graph.graph) {
    if (!SOCIAL_PLATFORMS.has(node.platform)) continue;
    if (node.followerCount != null && node.followerCount > max) {
      max = node.followerCount;
    }
  }
  return max;
}

function identityAgeDays(mintedAt?: string): number {
  if (!mintedAt) return 0;
  const ms = Date.now() - new Date(mintedAt).getTime();
  if (!Number.isFinite(ms) || ms < 0) return 0;
  return Math.floor(ms / (1000 * 60 * 60 * 24));
}

function rankLabel(score: number): CultureScoreRank {
  if (score >= 8) return { label: "Top 1% of Culture Layer builders" };
  if (score >= 6.5) return { label: "Top 2% of Culture Layer builders" };
  if (score >= 5) return { label: "Top 10% of Culture Layer builders" };
  if (score >= 3.5) return { label: "Growing Culture Layer presence" };
  return { label: "Early Culture Layer identity" };
}

export function computeCultureScore(input: CultureScoreInput): ComputedCultureScore {
  const {
    resolved,
    graph,
    nftCount = 0,
    txCount = 0,
    member,
    credentialCount = 0,
    humanVerified = false,
    isRisky = false,
  } = input;

  const socialFollowers = maxSocialFollowers(graph);
  const platformCount = graph ? Object.keys(graph.platformCounts).length : 0;
  const verifiedLinks = graph?.verifiedLinkCount ?? 0;
  const ageDays = identityAgeDays(resolved.mintedAt);
  const culturePoints = member?.culturePoints ?? 0;
  const supportScore = member?.supportScore ?? 0;
  const completedQuestCount = member?.completedQuestCount ?? 0;
  const referralCount = member?.referralCount ?? 0;
  const buildCount = member?.buildCount ?? 0;
  const agentUseCount = member?.agentUseCount ?? 0;

  const credentialsPct = clampPercent((Math.min(credentialCount, 6) / 6) * 100);
  const contributionsPct = clampPercent(
    (Math.min(culturePoints, 500) / 500) * 50 +
      (Math.min(completedQuestCount, 12) / 12) * 30 +
      (Math.min(buildCount, 5) / 5) * 20,
  );
  const socialTrustPct = clampPercent(
    (Math.log10(socialFollowers + 1) / 5) * 70 + (verifiedLinks / 8) * 30,
  );
  const identityDepthPct = clampPercent((platformCount / 6) * 60 + Math.min(ageDays / 365, 1) * 40);
  const onchainPct = clampPercent(
    (Math.min(nftCount, 12) / 12) * 60 + (Math.min(txCount, 50) / 50) * 40,
  );
  const ecosystemPct = clampPercent(
    (Math.min(supportScore, 2000) / 2000) * 40 +
      (Math.min(agentUseCount, 10) / 10) * 30 +
      (Math.min(culturePoints, 500) / 500) * 30,
  );
  const leadershipPct = clampPercent(
    (Math.min(referralCount, 5) / 5) * 60 + (Math.min(buildCount, 5) / 5) * 40,
  );
  const humanPct = humanVerified ? 100 : clampPercent((verifiedLinks / 8) * 40);

  const dimensions: CultureScoreDimension[] = [
    { id: "credentials", label: "Credentials", percent: credentialsPct },
    { id: "contributions", label: "Contributions", percent: contributionsPct },
    { id: "social-trust", label: "Social trust", percent: socialTrustPct },
    { id: "identity-depth", label: "Identity depth", percent: identityDepthPct },
    { id: "onchain", label: "Onchain presence", percent: onchainPct },
    { id: "ecosystem", label: "Ecosystem participation", percent: ecosystemPct },
    { id: "leadership", label: "Referrals & leadership", percent: leadershipPct },
    { id: "human", label: "Human verification", percent: humanPct },
  ];

  let weighted =
    credentialsPct * 0.2 +
    contributionsPct * 0.18 +
    socialTrustPct * 0.12 +
    identityDepthPct * 0.1 +
    onchainPct * 0.1 +
    ecosystemPct * 0.12 +
    leadershipPct * 0.08 +
    humanPct * 0.1;

  if (isRisky) {
    weighted *= 0.85;
  }

  const score = Math.round((weighted / 10) * 1000) / 1000;

  const noteParts: string[] = [];
  if (graph?.primaryNode?.platform) {
    noteParts.push(`from ${graph.primaryNode.platform}`);
  }
  if (platformCount > 0) {
    noteParts.push(`${platformCount} platforms`);
  }
  if (completedQuestCount > 0) {
    noteParts.push(`${completedQuestCount} quests`);
  }
  if (credentialCount > 0) {
    noteParts.push(`${credentialCount} credentials`);
  }
  const note = noteParts.length > 0 ? noteParts.join(" · ") : "from wallet + contributions";

  return {
    score,
    note,
    rank: rankLabel(score),
    dimensions,
  };
}

/** Public alias — Culture Reputation uses the same engine as Culture Score. */
export const computeCultureReputation = computeCultureScore;

/** Wallet-only score when user has no .culture name yet. */
export function computeWalletCultureScore(member: MemberProfileBridge): ComputedCultureScore {
  return computeCultureScore({
    resolved: {
      ok: true,
      configured: false,
      status: "unconfigured",
      fullName: "member.culture",
      isFounding: member.supporterTier === "founding" || member.supporterTier === "founder",
    },
    graph: null,
    nftCount: 0,
    txCount: 0,
    member,
  });
}
