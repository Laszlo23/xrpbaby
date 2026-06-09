import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";

type QuestStatus = "available" | "completed" | "locked";

const QUESTS = [
  {
    id: "q_tg_connect_wallet",
    type: "onboarding",
    title: "Connect TON wallet",
    xpReward: 50,
  },
  {
    id: "q_xrp_learn_1",
    type: "learning",
    title: "Complete XRP liquidity lesson",
    xpReward: 40,
  },
  {
    id: "q_bcc_learn_1",
    type: "learning",
    title: "Complete BCC liquidity lesson",
    xpReward: 45,
  },
  {
    id: "q_tg_gratitude_1",
    type: "community",
    title: "Send gratitude to a contributor",
    xpReward: 35,
  },
] as const;

export const Route = createFileRoute("/api/tg/quests")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-quests", 120);
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
        const recentEvents = await prisma.activityEvent.findMany({
          where: { memberId: member.id, type: "tg:quest_claimed" },
          orderBy: { createdAt: "desc" },
          take: 200,
        });

        const completed = new Set<string>();
        for (const evt of recentEvents) {
          const payload =
            evt.payload && typeof evt.payload === "object"
              ? (evt.payload as Record<string, unknown>)
              : null;
          const questId = typeof payload?.questId === "string" ? payload.questId : undefined;
          if (questId) completed.add(questId);
        }

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
            where: {
              memberId: member.id,
              type: "tg:gratitude_sent",
            },
            select: { id: true },
          })) !== null;

        return json({
          ok: true,
          quests: QUESTS.map((q) => ({
            ...q,
            status: questStatus(
              q.id,
              completed,
              tonConnected,
              xrpLearnCompleted,
              bccLearnCompleted,
              gratitudeCompleted,
            ),
          })),
        });
      },
    },
  },
  component: () => null,
});

function questStatus(
  id: string,
  completed: Set<string>,
  tonConnected: boolean,
  xrpLearnCompleted: boolean,
  bccLearnCompleted: boolean,
  gratitudeCompleted: boolean,
): QuestStatus {
  if (completed.has(id)) return "completed";
  if (id === "q_tg_connect_wallet" && !tonConnected) return "locked";
  if (id === "q_xrp_learn_1" && !xrpLearnCompleted) return "locked";
  if (id === "q_bcc_learn_1" && !bccLearnCompleted) return "locked";
  if (id === "q_tg_gratitude_1" && !gratitudeCompleted) return "locked";
  return "available";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
