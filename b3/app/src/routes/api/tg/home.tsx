import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember, getCulturePoints, progressionFromPoints } from "@/server/tg/member";
import { computeStreakDays, hasCheckedInToday } from "@/server/tg/streak";
import {
  coreMissionsCompleted,
  forestStageFromLevel,
  nextAvailableTask,
  resolveTaskStatuses,
} from "@/server/tg/tasks";

export const Route = createFileRoute("/api/tg/home")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-home", 120);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });
        const points = await getCulturePoints(prisma, member.walletId);
        const progression = progressionFromPoints(points);
        const streakDays = await computeStreakDays(prisma, member.id);
        const checkedInToday = await hasCheckedInToday(prisma, member.id);
        const tasks = await resolveTaskStatuses(prisma, member.id);
        const currentMission = nextAvailableTask(tasks);
        const coreDone = coreMissionsCompleted(tasks);

        const tonEvent = await prisma.activityEvent.findFirst({
          where: { memberId: member.id, type: "tg:ton_wallet_connected" },
          orderBy: { createdAt: "desc" },
        });
        const tonPayload =
          tonEvent?.payload && typeof tonEvent.payload === "object"
            ? (tonEvent.payload as Record<string, unknown>)
            : null;

        const memberCount = await prisma.socialAccount.count({
          where: { platform: "telegram", verified: true },
        });

        return json({
          ok: true,
          member: {
            id: member.id,
            displayName: member.displayName,
            walletAddress: member.walletAddress,
            blockNumber: memberCount,
          },
          wallets: {
            tonConnected: Boolean(tonEvent),
            tonWalletAddress:
              typeof tonPayload?.walletAddress === "string" ? tonPayload.walletAddress : null,
          },
          gamification: {
            ...progression,
            streakDays,
            forestStage: forestStageFromLevel(progression.level),
            checkedInToday,
            coreMissionsCompleted: coreDone,
          },
          currentMission,
          tasks: tasks.filter((t) => t.id !== "ton_bonus" || coreDone >= 3),
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
