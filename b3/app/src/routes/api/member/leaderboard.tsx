import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit } from "@/server/platform/rate-limit";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  limit: z.coerce.number().min(1).max(50).optional(),
});

export const Route = createFileRoute("/api/member/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "member-leaderboard", 60);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          address: url.searchParams.get("address"),
          limit: url.searchParams.get("limit") ?? "25",
        });
        if (!parsed.success) return json({ ok: false, error: "invalid_query" }, 400);

        const sort = url.searchParams.get("sort") === "support" ? "support" : "points";
        const limit = parsed.data.limit ?? 25;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        if (sort === "support") {
          const rows = await prisma.member.findMany({
            where: { supportScore: { not: null }, walletAddress: { not: null } },
            orderBy: { supportScore: "desc" },
            take: limit,
            select: {
              walletAddress: true,
              displayName: true,
              farcasterUsername: true,
              supportScore: true,
              neynarScore: true,
              supporterTier: true,
            },
          });
          return json({
            ok: true,
            sort: "support",
            rows: rows.map((r) => ({
              address: r.walletAddress,
              displayName: r.displayName,
              farcasterUsername: r.farcasterUsername,
              supportScore: r.supportScore ?? 0,
              neynarScore: r.neynarScore,
              supporterTier: r.supporterTier,
            })),
          });
        }

        const agg = await prisma.$queryRaw<
          Array<{
            address: string;
            points: number;
            supportScore: number | null;
            farcasterUsername: string | null;
          }>
        >`
          SELECT w.address,
                 COALESCE(SUM(pl.delta), 0)::int AS points,
                 m."supportScore",
                 m."farcasterUsername"
          FROM "Wallet" w
          INNER JOIN "PointLedger" pl ON pl."walletId" = w.id
          LEFT JOIN "Member" m ON m."walletId" = w.id
          GROUP BY w.id, w.address, m."supportScore", m."farcasterUsername"
          ORDER BY points DESC
          LIMIT ${limit}
        `;
        return json({
          ok: true,
          sort: "points",
          rows: agg.map((row) => ({
            address: row.address,
            points: row.points,
            supportScore: row.supportScore ?? 0,
            farcasterUsername: row.farcasterUsername,
          })),
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=60",
    },
  });
}
