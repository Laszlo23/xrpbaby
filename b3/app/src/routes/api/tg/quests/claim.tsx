import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember, progressionFromPoints, getCulturePoints } from "@/server/tg/member";

const bodySchema = z.object({
  questId: z.string().min(1).max(128),
});

const QUEST_REWARDS: Record<string, number> = {
  q_tg_connect_wallet: 50,
  q_xrp_learn_1: 40,
  q_bcc_learn_1: 45,
  q_tg_gratitude_1: 35,
};

export const Route = createFileRoute("/api/tg/quests/claim")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-quest-claim", 60);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const rawBody = await readJsonBody(request, 8192);
        if (!rawBody.ok) return json({ ok: false, error: rawBody.error }, rawBody.status);
        const parsed = bodySchema.safeParse(rawBody.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);
        const questId = parsed.data.questId;
        const xpReward = QUEST_REWARDS[questId];
        if (!xpReward) return json({ ok: false, error: "unknown_quest" }, 404);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });
        const tonConnected =
          (await prisma.activityEvent.findFirst({
            where: { memberId: member.id, type: "tg:ton_wallet_connected" },
            select: { id: true },
          })) !== null;
        const xrpLearnCompleted =
          (await prisma.activityEvent.findFirst({
            where: {
              memberId: member.id,
              type: "tg:learn_completed",
              payload: { path: ["moduleId"], equals: "m_xrp_liquidity_basics" },
            },
            select: { id: true },
          })) !== null;
        const bccLearnCompleted =
          (await prisma.activityEvent.findFirst({
            where: {
              memberId: member.id,
              type: "tg:learn_completed",
              payload: { path: ["moduleId"], equals: "m_bcc_liquidity_basics" },
            },
            select: { id: true },
          })) !== null;
        const gratitudeCompleted =
          (await prisma.activityEvent.findFirst({
            where: { memberId: member.id, type: "tg:gratitude_sent" },
            select: { id: true },
          })) !== null;
        if (questId === "q_tg_connect_wallet" && !tonConnected) {
          return json({ ok: false, error: "quest_locked_connect_ton_first" }, 409);
        }
        if (questId === "q_xrp_learn_1" && !xrpLearnCompleted) {
          return json({ ok: false, error: "quest_locked_learning_required" }, 409);
        }
        if (questId === "q_bcc_learn_1" && !bccLearnCompleted) {
          return json({ ok: false, error: "quest_locked_bcc_learning_required" }, 409);
        }
        if (questId === "q_tg_gratitude_1" && !gratitudeCompleted) {
          return json({ ok: false, error: "quest_locked_gratitude_required" }, 409);
        }

        const alreadyClaimed = await prisma.activityEvent.findFirst({
          where: {
            memberId: member.id,
            type: "tg:quest_claimed",
            payload: {
              path: ["questId"],
              equals: questId,
            },
          },
          select: { id: true },
        });
        if (alreadyClaimed) {
          const points = await getCulturePoints(prisma, member.walletId);
          return json({
            ok: true,
            idempotent: true,
            xpGranted: 0,
            progression: progressionFromPoints(points),
          });
        }

        if (!member.walletId) {
          return json({ ok: false, error: "wallet_not_linked" }, 409);
        }

        await prisma.pointLedger.create({
          data: {
            walletId: member.walletId,
            delta: xpReward,
            reason: "tg_quest_reward",
            taskSlug: questId,
            metadata: {
              questId,
              source: "telegram",
            },
          },
        });
        await prisma.activityEvent.create({
          data: {
            memberId: member.id,
            type: "tg:quest_claimed",
            sourceModule: "telegram",
            payload: { questId, xpReward },
          },
        });

        const points = await getCulturePoints(prisma, member.walletId);
        const progression = progressionFromPoints(points);

        return json({
          ok: true,
          xpGranted: xpReward,
          progression,
          unlocked:
            questId === "q_tg_connect_wallet"
              ? ["q_xrp_learn_1"]
              : questId === "q_xrp_learn_1"
                ? ["q_tg_gratitude_1"]
                : [],
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
