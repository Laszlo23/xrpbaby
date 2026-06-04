import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { syncMemberSupportScore } from "@/server/social/support-score-sync";
import { verifyPrivyAccessToken } from "@/server/wallet/privy-auth";

const querySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/social/sync-score")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "sync-score", 10);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
        if ("error" in auth) return json({ ok: false, error: auth.error }, auth.status);

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          walletAddress: url.searchParams.get("walletAddress"),
        });
        if (!parsed.success) return json({ ok: false, error: "invalid_address" }, 400);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const addr = parsed.data.walletAddress.toLowerCase();
        const member = await prisma.member.findFirst({ where: { walletAddress: addr } });
        if (!member) return json({ ok: false, error: "member_not_found" }, 404);

        const snapshot = await syncMemberSupportScore(prisma, member.id);
        if (!snapshot) return json({ ok: false, error: "sync_failed" }, 500);

        return json({
          ok: true,
          neynarScore: snapshot.neynarScore,
          supportScore: snapshot.supportScore,
          farcaster: snapshot.farcasterFid
            ? { fid: snapshot.farcasterFid, username: snapshot.farcasterUsername }
            : null,
          verifiedSocials: snapshot.verifiedSocials,
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
