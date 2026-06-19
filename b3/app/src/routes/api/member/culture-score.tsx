import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/member/culture-score")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({ address: url.searchParams.get("address") });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const addr = parsed.data.address.toLowerCase();
        const member = await prisma.member.findFirst({
          where: { walletAddress: addr },
          include: {
            wallet: {
              include: {
                ledgers: { select: { delta: true } },
              },
            },
          },
        });

        if (!member) {
          return json({ ok: true, score: null });
        }

        const culturePoints = member.wallet?.ledgers.reduce((sum, row) => sum + row.delta, 0) ?? 0;

        const { buildMemberProfileBridge } = await import("@/server/identity/member-score-bridge");
        const { computeWalletCultureScore } = await import("@/lib/identity/culture-score");

        const bridge = await buildMemberProfileBridge(prisma, {
          memberId: member.id,
          walletId: member.walletId,
          walletAddress: addr,
          farcasterUsername: member.farcasterUsername,
          supportScore: member.supportScore,
          culturePoints,
          supporterTier: member.supporterTier,
        });

        const computed = computeWalletCultureScore(bridge);

        return json({
          ok: true,
          score: {
            value: computed.score,
            note: computed.note,
            rank: computed.rank,
            dimensions: computed.dimensions,
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
      "Cache-Control": "private, max-age=60",
    },
  });
}
