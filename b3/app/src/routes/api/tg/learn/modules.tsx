import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";

const MODULES = [
  {
    id: "m_xrp_liquidity_basics",
    title: "XRP liquidity basics",
    durationMin: 4,
    xpReward: 30,
  },
  {
    id: "m_bcc_liquidity_basics",
    title: "BCC liquidity on Base",
    durationMin: 5,
    xpReward: 35,
  },
  {
    id: "m_aerodrome_gauges",
    title: "Aerodrome gauges & LP",
    durationMin: 4,
    xpReward: 30,
  },
  {
    id: "m_ton_wallet_safety",
    title: "TON wallet safety",
    durationMin: 3,
    xpReward: 30,
  },
  {
    id: "m_gratitude_support_loop",
    title: "Gratitude loop: support, educate, create",
    durationMin: 2,
    xpReward: 25,
  },
] as const;

export const Route = createFileRoute("/api/tg/learn/modules")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-learn-modules", 120);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });
        const completedRows = await prisma.activityEvent.findMany({
          where: { memberId: member.id, type: "tg:learn_completed" },
          orderBy: { createdAt: "desc" },
          take: 200,
        });
        const completed = new Set<string>();
        for (const row of completedRows) {
          const payload =
            row.payload && typeof row.payload === "object"
              ? (row.payload as Record<string, unknown>)
              : null;
          const moduleId = typeof payload?.moduleId === "string" ? payload.moduleId : undefined;
          if (moduleId) completed.add(moduleId);
        }

        const tonConnected =
          (await prisma.activityEvent.findFirst({
            where: { memberId: member.id, type: "tg:ton_wallet_connected" },
            select: { id: true },
          })) !== null;

        return json({
          ok: true,
          modules: MODULES.map((m) => ({
            ...m,
            status: moduleStatus(m.id, completed, tonConnected),
          })),
        });
      },
    },
  },
  component: () => null,
});

function moduleStatus(id: string, completed: Set<string>, tonConnected: boolean) {
  if (completed.has(id)) return "completed";
  if (id === "m_aerodrome_gauges" && !completed.has("m_bcc_liquidity_basics")) return "locked";
  if (id === "m_ton_wallet_safety" && !tonConnected) return "locked";
  return "available";
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
