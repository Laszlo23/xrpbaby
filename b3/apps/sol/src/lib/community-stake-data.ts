import type { MemberPlan } from "@/generated/prisma/client";
import { PLAN_PRICES_CENTS } from "@/lib/tracks-data";

/** Minimum share of membership fee locked as BCC for community staking */
export const COMMUNITY_LOCK_RATIO = 0.5;

/** Demo conversion: BCC tokens per $1 of locked value */
export const BCC_PER_DOLLAR_LOCKED = 100;

export type CommunityStakeStatus = "pending_wallet" | "locked_staking";

export function paidCentsForPlan(plan: MemberPlan): number {
  return PLAN_PRICES_CENTS[plan] ?? 0;
}

export function computeCommunityStake(paidCents: number) {
  if (paidCents <= 0) {
    return { lockCents: 0, bccAmount: 0, lockRatio: COMMUNITY_LOCK_RATIO };
  }
  const lockCents = Math.round(paidCents * COMMUNITY_LOCK_RATIO);
  const lockDollars = lockCents / 100;
  const bccAmount = Math.floor(lockDollars * BCC_PER_DOLLAR_LOCKED);
  return { lockCents, bccAmount, lockRatio: COMMUNITY_LOCK_RATIO };
}

export function formatUsd(cents: number): string {
  return `$${(cents / 100).toFixed(cents % 100 === 0 ? 0 : 2)}`;
}

export const COMMUNITY_STAKE_COPY = {
  headline: "50%+ of your fee locked in BCC — staked for the community",
  subline:
    "Every membership payment backs the tribe. At least half converts to BCC, locked and staked in the community pool. You build. The pool compounds. Everyone wins.",
  memberBenefit: "Your locked BCC earns with the community stake pool while you stay active.",
  communityBenefit: "Staked BCC funds proof bounties, partner rewards, and shared upside.",
} as const;
