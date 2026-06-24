import type { PrismaClient } from "@prisma/client";

import { FEEDBACK_REWARDS } from "@/server/feedback/constants";
import { creditPointsIdempotent } from "@/server/points/credit-idempotent";
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
  const reasonKey = `feedback_reward:${input.tier}:${input.feedbackId}`;

  const credit = await creditPointsIdempotent(prisma, {
    walletId: input.walletId,
    delta: reward.points,
    reason: reasonKey,
    taskSlug: reward.slug,
    idempotencyKey: `feedback:${input.tier}:${input.feedbackId}`,
    metadata: { feedbackId: input.feedbackId, tier: input.tier },
  });

  if (credit.credited) {
    await logActivity(prisma, {
      memberId: input.memberId,
      type: "feedback:rewarded",
      sourceModule: "app",
      payload: { feedbackId: input.feedbackId, tier: input.tier, points: reward.points },
    });
  }

  return {
    granted: credit.credited ? credit.pointsGranted : 0,
    alreadyGranted: credit.alreadyCredited,
  };
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
