import type { PrismaClient } from "@prisma/client";

import { currentWeekBucket, FEEDBACK_AREAS, type FeedbackArea } from "@/server/feedback/constants";
import { grantFeedbackPoints } from "@/server/feedback/grant-reward";
import { scoreFeedbackQuality } from "@/server/feedback/quality-score";
import { notifyFeedbackWebhook } from "@/server/feedback/webhook";
import { logActivity } from "@/server/platform/member";

export type SubmitFeedbackInput = {
  memberId: string;
  walletId: string;
  source: "web" | "telegram";
  area: string;
  triedWhat: string;
  problem: string;
  suggestion?: string;
  evidenceUrl?: string;
  pagePath?: string;
};

export async function submitProductFeedback(prisma: PrismaClient, input: SubmitFeedbackInput) {
  const area = FEEDBACK_AREAS.includes(input.area as FeedbackArea) ? input.area : "other";
  const weekBucket = currentWeekBucket();

  const existingWeek = await prisma.productFeedback.findFirst({
    where: {
      memberId: input.memberId,
      weekBucket,
      status: { not: "rejected" },
    },
  });
  if (existingWeek) {
    return {
      ok: false as const,
      error: "weekly_limit_reached",
      detail: "One valid Builder Voice submission per week.",
    };
  }

  const prior = await prisma.productFeedback.findMany({
    where: { memberId: input.memberId },
    orderBy: { createdAt: "desc" },
    take: 3,
    select: { problem: true },
  });

  const duplicateElsewhere = await prisma.productFeedback.findFirst({
    where: {
      memberId: { not: input.memberId },
      problem: { equals: input.problem.trim(), mode: "insensitive" },
      createdAt: { gte: new Date(Date.now() - 7 * 86_400_000) },
      status: { not: "rejected" },
    },
    select: { id: true },
  });

  const quality = scoreFeedbackQuality(
    {
      triedWhat: input.triedWhat,
      problem: input.problem,
      suggestion: input.suggestion,
      evidenceUrl: input.evidenceUrl,
      pagePath: input.pagePath,
      area,
    },
    {
      priorProblems: prior.map((p) => p.problem),
      duplicateProblemElsewhere: Boolean(duplicateElsewhere),
    },
  );

  const status = quality.passed ? "pending_review" : "rejected";
  const record = await prisma.productFeedback.create({
    data: {
      memberId: input.memberId,
      source: input.source,
      area,
      triedWhat: input.triedWhat.trim().slice(0, 4000),
      problem: input.problem.trim().slice(0, 8000),
      suggestion: input.suggestion?.trim().slice(0, 4000) || null,
      evidenceUrl: input.evidenceUrl?.trim().slice(0, 500) || null,
      pagePath: input.pagePath?.trim().slice(0, 200) || null,
      qualityScore: quality.score,
      status,
      rejectReason: quality.rejectReason,
      weekBucket: quality.passed ? weekBucket : null,
    },
  });

  await logActivity(prisma, {
    memberId: input.memberId,
    type: "feedback:submitted",
    sourceModule: "app",
    payload: {
      feedbackId: record.id,
      status,
      score: quality.score,
      area,
    },
  });

  let pointsGranted = 0;
  if (quality.passed) {
    const grant = await grantFeedbackPoints(prisma, {
      memberId: input.memberId,
      walletId: input.walletId,
      feedbackId: record.id,
      tier: "submit",
    });
    pointsGranted = grant.granted;
    if (pointsGranted > 0) {
      await prisma.productFeedback.update({
        where: { id: record.id },
        data: { pointsGranted },
      });
    }
    void notifyFeedbackWebhook({
      feedbackId: record.id,
      area,
      score: quality.score,
      status,
      triedWhat: input.triedWhat,
      problem: input.problem,
      pagePath: input.pagePath,
      memberId: input.memberId,
    });
  }

  return {
    ok: true as const,
    feedbackId: record.id,
    status,
    qualityScore: quality.score,
    pointsGranted,
    rejectReason: quality.rejectReason,
    coachingTips: quality.coachingTips,
  };
}
