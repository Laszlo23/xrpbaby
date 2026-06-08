import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";

const querySchema = z.object({
  limit: z.coerce.number().min(1).max(50).optional(),
});

export const Route = createFileRoute("/api/tg/leaderboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-leaderboard", 60);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({ limit: url.searchParams.get("limit") ?? "10" });
        const limit = parsed.success ? (parsed.data.limit ?? 10) : 10;

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });

        const rows = await prisma.$queryRaw<
          Array<{
            memberId: string;
            displayName: string;
            points: number;
            walletAddress: string;
          }>
        >`
          SELECT m.id AS "memberId",
                 m."displayName",
                 COALESCE(SUM(pl.delta), 0)::int AS points,
                 w.address AS "walletAddress"
          FROM "SocialAccount" sa
          INNER JOIN "Member" m ON m.id = sa."memberId"
          INNER JOIN "Wallet" w ON w.id = m."walletId"
          LEFT JOIN "PointLedger" pl ON pl."walletId" = w.id
          WHERE sa.platform = 'telegram' AND sa.verified = true
          GROUP BY m.id, m."displayName", w.address
          ORDER BY points DESC
          LIMIT ${limit}
        `;

        const allRanked = await prisma.$queryRaw<
          Array<{ memberId: string; points: number }>
        >`
          SELECT m.id AS "memberId",
                 COALESCE(SUM(pl.delta), 0)::int AS points
          FROM "SocialAccount" sa
          INNER JOIN "Member" m ON m.id = sa."memberId"
          INNER JOIN "Wallet" w ON w.id = m."walletId"
          LEFT JOIN "PointLedger" pl ON pl."walletId" = w.id
          WHERE sa.platform = 'telegram' AND sa.verified = true
          GROUP BY m.id
          ORDER BY points DESC
        `;

        const myIdx = allRanked.findIndex((r) => r.memberId === member.id);
        const myRank = myIdx === -1 ? null : myIdx + 1;
        const myPoints = myIdx === -1 ? 0 : allRanked[myIdx].points;
        const ahead = myIdx > 0 ? allRanked[myIdx - 1] : null;
        const xpBehind =
          ahead && myRank !== null && myRank > 1 ? Math.max(0, ahead.points - myPoints) : null;

        return json({
          ok: true,
          rows: rows.map((r, i) => ({
            rank: i + 1,
            displayName: r.displayName,
            points: r.points,
            isYou: r.memberId === member.id,
          })),
          you: {
            rank: myRank,
            points: myPoints,
            xpBehindNext: xpBehind,
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
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=30",
    },
  });
}
