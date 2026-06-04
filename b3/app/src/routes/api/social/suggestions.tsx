import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { getNeynarClient } from "@/server/neynar/client";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  limit: z.coerce.number().min(1).max(20).optional(),
});

export const Route = createFileRoute("/api/social/suggestions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "social-suggestions", 30);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({
          address: url.searchParams.get("address"),
          limit: url.searchParams.get("limit") ?? "8",
        });
        if (!parsed.success) return json({ ok: false, error: "invalid_address" }, 400);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const addr = parsed.data.address.toLowerCase();
        const member = await prisma.member.findFirst({
          where: { walletAddress: addr },
          include: { socialAccounts: true },
        });

        const limit = parsed.data.limit ?? 8;
        const suggestions: Array<{
          address: string;
          displayName: string | null;
          farcasterUsername: string | null;
          supportScore: number;
          reason: string;
        }> = [];

        const candidates = await prisma.member.findMany({
          where: {
            walletAddress: { not: addr },
            supportScore: { not: null },
            farcasterFid: { not: null },
          },
          orderBy: { supportScore: "desc" },
          take: limit * 3,
          select: {
            walletAddress: true,
            displayName: true,
            farcasterUsername: true,
            supportScore: true,
            farcasterFid: true,
          },
        });

        const client = getNeynarClient();
        let followingFids = new Set<number>();
        if (client && member?.farcasterFid) {
          try {
            const res = await client.fetchUserFollowing({ fid: member.farcasterFid, limit: 100 });
            followingFids = new Set(res.users.map((u) => u.user.fid));
          } catch {
            /* best-effort */
          }
        }

        for (const c of candidates) {
          if (!c.walletAddress || suggestions.length >= limit) break;
          const alreadyFollowing = c.farcasterFid != null && followingFids.has(c.farcasterFid);
          suggestions.push({
            address: c.walletAddress,
            displayName: c.displayName,
            farcasterUsername: c.farcasterUsername,
            supportScore: c.supportScore ?? 0,
            reason: alreadyFollowing ? "mutual_supporter" : "high_support_score",
          });
        }

        return json({ ok: true, suggestions: suggestions.slice(0, limit) });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=120" },
  });
}
