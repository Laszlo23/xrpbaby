import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import {
  fetchFarcasterUsername,
  fetchNeynarAuthorizeUrl,
  verifyNeynarSigner,
} from "@/server/neynar/client";
import { linkFarcasterToMember, unlinkFarcasterFromMember } from "@/server/platform/member";
import { syncMemberSupportScore } from "@/server/social/support-score-sync";
import { verifyPrivyAccessToken } from "@/server/wallet/privy-auth";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fid: z.number().int().positive(),
  signerUuid: z.string().min(8),
});

export const Route = createFileRoute("/api/social/link-farcaster")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "link-farcaster", 20);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const raw = await readJsonBody(request);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
        if ("error" in auth) return json({ ok: false, error: auth.error }, auth.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        try {
          const valid = await verifyNeynarSigner(parsed.data.fid, parsed.data.signerUuid);
          if (!valid) return json({ ok: false, error: "signer_not_verified" }, 400);

          const username = (await fetchFarcasterUsername(parsed.data.fid)) ?? undefined;
          const member = await linkFarcasterToMember(
            prisma,
            parsed.data.walletAddress,
            parsed.data.fid,
            username,
          );
          const snapshot = await syncMemberSupportScore(prisma, member.id);

          return json({
            ok: true,
            memberId: member.id,
            farcaster: { fid: parsed.data.fid, username: username ?? null },
            neynarScore: snapshot?.neynarScore ?? null,
            supportScore: snapshot?.supportScore ?? 0,
          });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "link_failed";
          const status = msg === "farcaster_fid_taken" ? 409 : 502;
          return json({ ok: false, error: msg }, status);
        }
      },
      DELETE: async ({ request }) => {
        const limited = checkRateLimit(request, "unlink-farcaster", 10);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
        if ("error" in auth) return json({ ok: false, error: auth.error }, auth.status);

        const url = new URL(request.url);
        const parsed = z
          .object({ walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/) })
          .safeParse({ walletAddress: url.searchParams.get("walletAddress") });
        if (!parsed.success) return json({ ok: false, error: "invalid_address" }, 400);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const addr = parsed.data.walletAddress.toLowerCase();
        const member = await prisma.member.findFirst({ where: { walletAddress: addr } });
        if (!member?.farcasterFid) {
          return json({ ok: false, error: "not_linked" }, 400);
        }

        await unlinkFarcasterFromMember(prisma, member.id);
        return json({ ok: true });
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
