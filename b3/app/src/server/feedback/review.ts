import type { PrismaClient } from "@prisma/client";

import type { FeedbackStatus } from "@/server/feedback/constants";
import { grantBuilderVoiceBadge, grantFeedbackPoints } from "@/server/feedback/grant-reward";

const REVIEW_STATUSES = new Set<FeedbackStatus>(["useful", "gold", "implemented"]);

export async function reviewProductFeedback(
  prisma: PrismaClient,
  input: {
    feedbackId: string;
    status: FeedbackStatus;
    reviewedBy: string;
    publicTitle?: string;
    showOnWall?: boolean;
  },
) {
  if (!REVIEW_STATUSES.has(input.status) && input.status !== "pending_review") {
    return { ok: false as const, error: "invalid_status" };
  }

  const record = await prisma.productFeedback.findUnique({
    where: { id: input.feedbackId },
    include: { member: { include: { wallet: true } } },
  });
  if (!record) return { ok: false as const, error: "not_found" };
  if (record.status === "rejected") {
    return { ok: false as const, error: "cannot_review_rejected" };
  }

  const walletId = record.member.walletId;
  if (!walletId) return { ok: false as const, error: "no_wallet" };

  let bonusPoints = 0;
  if (input.status === "useful") {
    const g = await grantFeedbackPoints(prisma, {
      memberId: record.memberId,
      walletId,
      feedbackId: record.id,
      tier: "useful",
    });
    bonusPoints += g.granted;
  } else if (input.status === "gold") {
    const g = await grantFeedbackPoints(prisma, {
      memberId: record.memberId,
      walletId,
      feedbackId: record.id,
      tier: "gold",
    });
    bonusPoints += g.granted;
    await grantBuilderVoiceBadge(prisma, record.memberId, record.id);
  }

  const updated = await prisma.productFeedback.update({
    where: { id: record.id },
    data: {
      status: input.status,
      reviewedAt: new Date(),
      reviewedBy: input.reviewedBy,
      publicTitle: input.publicTitle?.trim().slice(0, 200) || record.publicTitle,
      showOnWall: input.showOnWall ?? record.showOnWall,
      pointsGranted: record.pointsGranted + bonusPoints,
    },
  });

  return {
    ok: true as const,
    feedback: updated,
    bonusPoints,
  };
}
