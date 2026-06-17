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
  const { resolved, graph, nftCount = 0, txCount = 0, member } = input;

  const socialFollowers = maxSocialFollowers(graph);
  const platformCount = graph ? Object.keys(graph.platformCounts).length : 0;
  const verifiedLinks = graph?.verifiedLinkCount ?? 0;
  const ageDays = identityAgeDays(resolved.mintedAt);
  const culturePoints = member?.culturePoints ?? 0;
  const supportScore = member?.supportScore ?? 0;

  const socialReachPct = clampPercent((Math.log10(socialFollowers + 1) / 5) * 100);
  const verifiedLinksPct = clampPercent((verifiedLinks / 8) * 100);
  const identityDepthPct = clampPercent((platformCount / 6) * 100);
  const onchainPct = clampPercent(
    (Math.min(nftCount, 12) / 12) * 60 + (Math.min(txCount, 50) / 50) * 40,
  );
  const cultureLayerPct = clampPercent(
    (resolved.isFounding ? 40 : 0) +
      (resolved.tokenId === "1" ? 30 : 0) +
      Math.min(ageDays / 365, 1) * 30,
  );
  const ecosystemPct = clampPercent(
    (Math.min(culturePoints, 500) / 500) * 50 + (Math.min(supportScore, 2000) / 2000) * 50,
  );

  const dimensions: CultureScoreDimension[] = [
    { id: "social-reach", label: "Social reach", percent: socialReachPct },
    { id: "verified-links", label: "Verified links", percent: verifiedLinksPct },
    { id: "identity-depth", label: "Identity depth", percent: identityDepthPct },
    { id: "onchain", label: "Onchain presence", percent: onchainPct },
    { id: "culture-layer", label: "Culture Layer", percent: cultureLayerPct },
    { id: "ecosystem", label: "Ecosystem participation", percent: ecosystemPct },
  ];

  const weighted =
    socialReachPct * 0.22 +
    verifiedLinksPct * 0.12 +
    identityDepthPct * 0.18 +
    onchainPct * 0.18 +
    cultureLayerPct * 0.15 +
    ecosystemPct * 0.15;

  const score = Math.round((weighted / 10) * 1000) / 1000;

  const noteParts: string[] = [];
  if (graph?.primaryNode?.platform) {
    noteParts.push(`from ${graph.primaryNode.platform}`);
  }
  if (platformCount > 0) {
    noteParts.push(`${platformCount} platforms`);
  }
  const note = noteParts.length > 0 ? noteParts.join(" · ") : "from onchain identity";

  return {
    score,
    note,
    rank: rankLabel(score),
    dimensions,
  };
}
