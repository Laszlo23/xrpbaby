import type { PrismaClient } from "@prisma/client";

import {
  quidliDailySendCapUsd,
  quidliGrantBountyUrl,
  quidliMaxPerRecipientUsd,
  quidliPublicWebhookUrl,
  quidliRewardChainId,
  quidliRewardConfigured,
  quidliRewardTokenAddress,
  quidliWebhookConfigured,
} from "@/server/quidli/env";
import { quidliSpendTodayUsd } from "@/server/quidli/policy";

export async function buildQuidliStatus(prisma: PrismaClient | null, origin?: string) {
  const sendsTodayUsd = prisma ? await quidliSpendTodayUsd(prisma) : 0;
  const recent = prisma
    ? await prisma.quidliDelivery.findMany({
        where: { status: { in: ["completed", "submitted"] } },
        orderBy: { createdAt: "desc" },
        take: 8,
        select: {
          id: true,
          platform: true,
          handle: true,
          status: true,
          campaign: true,
          taskSlug: true,
          createdAt: true,
        },
      })
    : [];

  return {
    ok: true,
    service: "quidli-connect",
    configured: quidliWebhookConfigured(),
    rewardConfigured: quidliRewardConfigured(),
    webhookUrl: quidliPublicWebhookUrl(origin),
    rewardToken: quidliRewardTokenAddress(),
    rewardChainId: quidliRewardChainId(),
    dailyCapUsd: quidliDailySendCapUsd(),
    maxPerRecipientUsd: quidliMaxPerRecipientUsd(),
    sendsTodayUsd: Math.round(sendsTodayUsd * 100) / 100,
    grantBountyUrl: quidliGrantBountyUrl() ?? null,
    recentDeliveries: recent.map((d) => ({
      ...d,
      createdAt: d.createdAt.toISOString(),
    })),
  };
}
