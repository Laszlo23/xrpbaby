import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/feedback/stats")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const monthStart = new Date();
        monthStart.setUTCDate(1);
        monthStart.setUTCHours(0, 0, 0, 0);

        const [total, implemented, pending, topRows] = await Promise.all([
          prisma.productFeedback.count({
            where: { status: { not: "rejected" } },
          }),
          prisma.productFeedback.count({ where: { status: "implemented" } }),
          prisma.productFeedback.count({ where: { status: "pending_review" } }),
          prisma.productFeedback.groupBy({
            by: ["memberId"],
            where: {
              status: { in: ["useful", "gold", "implemented"] },
              createdAt: { gte: monthStart },
            },
            _sum: { pointsGranted: true },
            _count: { id: true },
          }),
        ]);

        const memberIds = topRows.map((r) => r.memberId);
        const members =
          memberIds.length > 0
            ? await prisma.member.findMany({
                where: { id: { in: memberIds } },
                select: {
                  id: true,
                  farcasterUsername: true,
                  displayName: true,
                  walletAddress: true,
                },
              })
            : [];
        const memberMap = new Map(members.map((m) => [m.id, m]));

        const sortedTop = [...topRows]
          .sort((a, b) => (b._sum.pointsGranted ?? 0) - (a._sum.pointsGranted ?? 0))
          .slice(0, 8);

        const topVoices = sortedTop.map((r) => {
          const m = memberMap.get(r.memberId);
          return {
            contributor: m?.farcasterUsername
              ? `@${m.farcasterUsername}`
              : m?.displayName
                ? m.displayName
                : m?.walletAddress
                  ? `${m.walletAddress.slice(0, 6)}…`
                  : "Builder",
            pointsGranted: r._sum.pointsGranted ?? 0,
            submissions: r._count.id,
          };
        });

        return json({
          ok: true,
          totalValid: total,
          implemented,
          pendingReview: pending,
          topVoicesThisMonth: topVoices,
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
