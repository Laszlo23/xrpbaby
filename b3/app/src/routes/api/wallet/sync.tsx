import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { verifyPrivyAccessToken, getPrivyFarcasterLink } from "@/server/wallet/privy-auth";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/wallet/sync")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "wallet-sync", 30);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const raw = await readJsonBody(request);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
        const privyConfigured =
          Boolean(process.env.PRIVY_APP_ID?.trim() || process.env.VITE_PRIVY_APP_ID?.trim()) &&
          Boolean(process.env.PRIVY_APP_SECRET?.trim());
        if (privyConfigured && !("userId" in auth)) {
          return json({ ok: false, error: auth.error }, auth.status);
        }
        const privyUserId = "userId" in auth ? auth.userId : undefined;

        let farcasterFid: number | undefined;
        let farcasterUsername: string | undefined;
        if (privyUserId) {
          const fc = await getPrivyFarcasterLink(privyUserId);
          if (fc) {
            farcasterFid = fc.fid;
            farcasterUsername = fc.username;
          }
        }

        const { ensureWalletAndMember, grantWelcomeRewards } =
          await import("@/server/platform/member");
        const { wallet, member } = await ensureWalletAndMember(prisma, parsed.data.walletAddress, {
          privyUserId,
          farcasterFid,
          farcasterUsername,
        });
        await grantWelcomeRewards(prisma, member.id, wallet.id);

        if (member.farcasterFid) {
          const { syncMemberSupportScore } = await import("@/server/social/support-score-sync");
          await syncMemberSupportScore(prisma, member.id).catch(() => {});
        }

        return json({ ok: true, memberId: member.id, walletId: wallet.id });
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
