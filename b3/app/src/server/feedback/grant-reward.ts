import type { PrismaClient } from "@prisma/client";

import { FEEDBACK_REWARDS } from "@/server/feedback/constants";
import { logActivity } from "@/server/platform/member";

type FeedbackTier = "submit" | "useful" | "gold";

export async function grantFeedbackPoints(
  prisma: PrismaClient,
  input: {
    memberId: string;
    walletId: string;
    feedbackId: string;
    tier: FeedbackTier;
  },
): Promise<{ granted: number; alreadyGranted: boolean }> {
  const reward = FEEDBACK_REWARDS[input.tier];
  const idempotencyReason = `feedback_${input.tier}:${input.feedbackId}`;

  const reasonKey = `feedback_reward:${input.tier}:${input.feedbackId}`;
  const existing = await prisma.pointLedger.findFirst({
    where: { walletId: input.walletId, reason: reasonKey },
  });
  if (existing) {
    return { granted: 0, alreadyGranted: true };
  }

  await prisma.pointLedger.create({
    data: {
      walletId: input.walletId,
      delta: reward.points,
      reason: reasonKey,
      taskSlug: reward.slug,
      metadata: { feedbackId: input.feedbackId, tier: input.tier },
    },
  });

  await logActivity(prisma, {
    memberId: input.memberId,
    type: "feedback:rewarded",
    sourceModule: "app",
    payload: { feedbackId: input.feedbackId, tier: input.tier, points: reward.points },
  });

  return { granted: reward.points, alreadyGranted: false };
}

export async function grantBuilderVoiceBadge(
  prisma: PrismaClient,
  memberId: string,
  feedbackId: string,
): Promise<boolean> {
  const existing = await prisma.rewardGrant.findFirst({
    where: { memberId, kind: "builder_voice_badge" },
  });
  if (existing) return false;

  await prisma.rewardGrant.create({
    data: {
      memberId,
      kind: "builder_voice_badge",
      amount: 1,
      metadata: { feedbackId },
    },
  });
  return true;
}
