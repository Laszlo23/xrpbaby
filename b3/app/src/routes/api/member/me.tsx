import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/member/me")({
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
          include: {
            wallet: {
              include: {
                ledgers: { orderBy: { createdAt: "desc" }, take: 20 },
              },
            },
            rewardGrants: { orderBy: { createdAt: "desc" }, take: 20 },
            activities: { orderBy: { createdAt: "desc" }, take: 30 },
          },
        });
        if (!member) {
          return json({ ok: true, member: null });
        }
        const balance =
          member.wallet?.ledgers.reduce((sum, row) => sum + row.delta, 0) ?? 0;
        return json({
          ok: true,
          member: {
            id: member.id,
            walletAddress: member.walletAddress,
            displayName: member.displayName,
            intent: member.intent,
            supporterTier: member.supporterTier,
            forestStage: member.forestStage,
            culturePoints: balance,
            recentActivities: member.activities,
            rewards: member.rewardGrants,
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
      "Cache-Control": "private, max-age=30",
    },
  });
}
