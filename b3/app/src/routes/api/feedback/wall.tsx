import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/feedback/wall")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const rows = await prisma.productFeedback.findMany({
          where: {
            showOnWall: true,
            status: { in: ["useful", "gold", "implemented"] },
          },
          orderBy: { reviewedAt: "desc" },
          take: 40,
          select: {
            id: true,
            area: true,
            status: true,
            publicTitle: true,
            pointsGranted: true,
            reviewedAt: true,
            createdAt: true,
            member: {
              select: {
                farcasterUsername: true,
                displayName: true,
                walletAddress: true,
              },
            },
          },
        });

        const items = rows.map((r) => ({
          id: r.id,
          area: r.area,
          status: r.status,
          title: r.publicTitle ?? "Product improvement",
          pointsGranted: r.pointsGranted,
          reviewedAt: r.reviewedAt?.toISOString() ?? null,
          contributor: r.member.farcasterUsername
            ? `@${r.member.farcasterUsername}`
            : r.member.displayName
              ? r.member.displayName
              : r.member.walletAddress
                ? `${r.member.walletAddress.slice(0, 6)}…${r.member.walletAddress.slice(-4)}`
                : "Builder",
        }));

        return json({ ok: true, items });
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
