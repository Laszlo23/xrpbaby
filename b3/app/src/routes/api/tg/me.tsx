import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember, getCulturePoints, progressionFromPoints } from "@/server/tg/member";
import { computeStreakDays } from "@/server/tg/streak";
import { forestStageFromLevel } from "@/server/tg/tasks";

export const Route = createFileRoute("/api/tg/me")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-me", 120);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
        const initData = auth.initData;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, initData.user, {
          allowSyntheticWallet: initData.hash === "dev",
        });
        const points = await getCulturePoints(prisma, member.walletId);
        const progression = progressionFromPoints(points);

        const recent = await prisma.activityEvent.findMany({
          where: {
            memberId: member.id,
            type: { in: ["tg:ton_wallet_connected", "tg:quest_claimed"] },
          },
          orderBy: { createdAt: "desc" },
          take: 50,
        });
        const tonEvent = recent.find((evt) => evt.type === "tg:ton_wallet_connected");
        const tonConnected = Boolean(tonEvent);
        const tonPayload =
          tonEvent?.payload && typeof tonEvent.payload === "object"
            ? (tonEvent.payload as Record<string, unknown>)
            : null;
        const tonWalletAddress =
          typeof tonPayload?.walletAddress === "string" ? tonPayload.walletAddress : null;
        const tonWalletApp = typeof tonPayload?.walletApp === "string" ? tonPayload.walletApp : null;
        const streakDays = await computeStreakDays(prisma, member.id);
        const forestStage = forestStageFromLevel(progression.level);
        const recentGrants = await prisma.rewardGrant.findMany({
          where: { memberId: member.id },
          orderBy: { createdAt: "desc" },
          take: 10,
        });
        const badges = recentGrants.map((grant) => grant.kind);

        return json({
          ok: true,
          member: {
            id: member.id,
            displayName: member.displayName,
            walletAddress: member.walletAddress,
          },
          wallets: {
            tonConnected,
            tonWalletAddress,
            tonWalletApp,
            evmConnected: Boolean(member.walletAddress),
          },
          gamification: {
            ...progression,
            streakDays,
            forestStage,
            badges,
          },
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
