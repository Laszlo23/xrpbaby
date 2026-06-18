import type { PrismaClient } from "@prisma/client";

import type { MemberProfileBridge } from "@/lib/identity/identity-graph-types";

export async function buildMemberProfileBridge(
  prisma: PrismaClient,
  input: {
    memberId: string;
    walletId: string | null;
    walletAddress: string;
    farcasterUsername: string | null;
    supportScore: number | null;
    culturePoints: number;
    supporterTier: string;
  },
): Promise<MemberProfileBridge> {
  if (!input.walletId) {
    return {
      farcasterUsername: input.farcasterUsername,
      supportScore: input.supportScore,
      culturePoints: input.culturePoints,
      supporterTier: input.supporterTier,
      completedQuestCount: 0,
      referralCount: 0,
      buildCount: 0,
      agentUseCount: 0,
    };
  }

  const tasks = await prisma.pointLedger.findMany({
    where: {
      walletId: input.walletId,
      reason: { in: ["task_completion", "welcome_forest"] },
      taskSlug: { not: null },
    },
    select: { taskSlug: true },
  });

  const slugs = tasks.map((t) => t.taskSlug).filter((s): s is string => Boolean(s));
  const completedQuestCount = new Set(slugs).size;
  const referralCount = slugs.filter((s) => s.includes("referral")).length;
  const buildCount = slugs.filter(
    (s) => s.startsWith("studio") || s.startsWith("builder") || s === "studio-first-app",
  ).length;

  const agentUseCount = await prisma.agentActionLog.count({
    where: {
      status: "ok",
      agentId: { in: ["grant_agent", "research_agent"] },
      params: { path: ["wallet"], equals: input.walletAddress.toLowerCase() },
    },
  });

  return {
    farcasterUsername: input.farcasterUsername,
    supportScore: input.supportScore,
    culturePoints: input.culturePoints,
    supporterTier: input.supporterTier,
    completedQuestCount,
    referralCount,
    buildCount,
    agentUseCount,
  };
}
