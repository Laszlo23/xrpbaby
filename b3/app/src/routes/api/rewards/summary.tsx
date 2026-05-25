import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/rewards/summary")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          address: url.searchParams.get("address"),
        });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }
        const addr = parsed.data.address.toLowerCase();
        const member = await prisma.member.findFirst({
          where: { walletAddress: addr },
          include: { rewardGrants: true, wallet: true },
        });
        if (!member?.wallet) {
          return json({
            ok: true,
            culturePoints: 0,
            grants: [],
            forestStage: "seedling",
            supporterTier: "community",
          });
        }
        const agg = await prisma.pointLedger.aggregate({
          where: { walletId: member.wallet.id },
          _sum: { delta: true },
        });
        const grantsByKind = member.rewardGrants.reduce<Record<string, number>>((acc, g) => {
          acc[g.kind] = (acc[g.kind] ?? 0) + g.amount;
          return acc;
        }, {});
        return json({
          ok: true,
          culturePoints: agg._sum.delta ?? 0,
          forestStage: member.forestStage,
          supporterTier: member.supporterTier,
          grants: grantsByKind,
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
