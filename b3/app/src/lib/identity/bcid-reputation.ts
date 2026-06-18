import type { MemberProfileBridge } from "@/lib/identity/identity-graph-types";

export type BcidScores = {
  builder: number;
  trust: number;
  contribution: number;
  verification: number;
};

export type BcidReputationInput = {
  /** Published Studio projects */
  studioProjectCount?: number;
  /** Onchain deploy events */
  deployCount?: number;
  /** Verified grant milestones */
  grantMilestoneCount?: number;
  /** Build task completions */
  buildTaskCount?: number;
  /** Active BCID credentials (tier-weighted) */
  credentialCount?: number;
  /** Credential tier sum (1–3) */
  credentialTierSum?: number;
  /** BCID identity age in days */
  identityAgeDays?: number;
  /** Recovery guardians configured (0–3) */
  guardianCount?: number;
  /** Verified linked accounts */
  verifiedLinkCount?: number;
  /** Culture Points */
  culturePoints?: number;
  /** Completed quests */
  completedQuestCount?: number;
  /** Campaign participations */
  campaignCount?: number;
  /** Verified referrals (referred user minted BCID) */
  verifiedReferralCount?: number;
  /** Web3.bio isHuman or verified-human credential */
  humanVerified?: boolean;
  /** World ID proof (future) */
  worldIdVerified?: boolean;
  /** Bridge contribution seed from .culture */
  contributionSeed?: number;
};

function clampScore(value: number): number {
  return Math.max(0, Math.min(100, Math.round(value)));
}

export function computeBcidReputation(input: BcidReputationInput): BcidScores {
  const {
    studioProjectCount = 0,
    deployCount = 0,
    grantMilestoneCount = 0,
    buildTaskCount = 0,
    credentialCount = 0,
    credentialTierSum = 0,
    identityAgeDays = 0,
    guardianCount = 0,
    verifiedLinkCount = 0,
    culturePoints = 0,
    completedQuestCount = 0,
    campaignCount = 0,
    verifiedReferralCount = 0,
    humanVerified = false,
    worldIdVerified = false,
    contributionSeed = 0,
  } = input;

  const builder = clampScore(
    (Math.min(studioProjectCount, 10) / 10) * 30 +
      (Math.min(deployCount, 5) / 5) * 25 +
      (Math.min(grantMilestoneCount, 3) / 3) * 25 +
      (Math.min(buildTaskCount, 10) / 10) * 20,
  );

  const trust = clampScore(
    (Math.min(credentialTierSum || credentialCount, 12) / 12) * 40 +
      Math.min(identityAgeDays / 365, 1) * 25 +
      (Math.min(guardianCount, 3) / 3) * 20 +
      (Math.min(verifiedLinkCount, 5) / 5) * 15,
  );

  const contribution = clampScore(
    (Math.min(culturePoints, 500) / 500) * 35 +
      (Math.min(completedQuestCount, 12) / 12) * 30 +
      (Math.min(campaignCount, 5) / 5) * 20 +
      (Math.min(verifiedReferralCount, 5) / 5) * 15 +
      Math.min(contributionSeed, 20),
  );

  let verification = 0;
  if (humanVerified) verification += 25;
  if (worldIdVerified) verification += 35;
  verification = clampScore(verification);

  return { builder, trust, contribution, verification };
}

export function memberToBcidReputationInput(
  member: MemberProfileBridge | null | undefined,
  extras: Partial<BcidReputationInput> = {},
): BcidReputationInput {
  if (!member) return extras;
  return {
    culturePoints: member.culturePoints ?? 0,
    completedQuestCount: member.completedQuestCount ?? 0,
    buildTaskCount: member.buildCount ?? 0,
    verifiedReferralCount: Math.min(member.referralCount ?? 0, 5),
    ...extras,
  };
}
