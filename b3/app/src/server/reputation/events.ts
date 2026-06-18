import { randomUUID } from "node:crypto";

import { getPrisma } from "@/server/db/prisma";

const DAILY_EVENT_CAP = 50;

export type ReputationEventInput = {
  identityId: string;
  type: string;
  weight?: number;
  source: string;
  proofRef?: string | null;
  metadata?: Record<string, unknown> | null;
};

export async function recordReputationEvent(input: ReputationEventInput): Promise<void> {
  const prisma = getPrisma();
  if (!prisma) return;

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000);
  const recentCount = await prisma.reputationEvent.count({
    where: { identityId: input.identityId, createdAt: { gte: since } },
  });
  if (recentCount >= DAILY_EVENT_CAP) return;

  await prisma.reputationEvent.create({
    data: {
      id: randomUUID(),
      identityId: input.identityId,
      type: input.type,
      weight: input.weight ?? 1,
      source: input.source,
      proofRef: input.proofRef ?? null,
      metadata: input.metadata ?? undefined,
    },
  });
}

export async function getReputationTimeline(identityId: string, limit = 20) {
  const prisma = getPrisma();
  if (!prisma) return [];
  return prisma.reputationEvent.findMany({
    where: { identityId },
    orderBy: { createdAt: "desc" },
    take: limit,
  });
}
