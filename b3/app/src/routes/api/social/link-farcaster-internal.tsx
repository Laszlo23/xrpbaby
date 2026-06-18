import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readJsonBody } from "@/server/platform/rate-limit";
import { requirePlatformInternalSecret } from "@/server/platform/admin-secret";
import { fetchFarcasterUsername } from "@/server/neynar/client";
import { linkFarcasterToMember } from "@/server/platform/member";
import { syncMemberSupportScore } from "@/server/social/support-score-sync";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  fid: z.number().int().positive(),
});

/** Trusted bridge from founding app (shared secret). Signer already verified upstream. */
export const Route = createFileRoute("/api/social/link-farcaster-internal")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const gate = requirePlatformInternalSecret(request);
        if (!gate.ok) {
          return json({ ok: false, error: gate.error }, gate.status);
        }

        const raw = await readJsonBody(request);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        try {
          const username = (await fetchFarcasterUsername(parsed.data.fid)) ?? undefined;
          const member = await linkFarcasterToMember(
            prisma,
            parsed.data.walletAddress,
            parsed.data.fid,
            username,
          );
          await syncMemberSupportScore(prisma, member.id);
          return json({ ok: true, memberId: member.id });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "link_failed";
          return json({ ok: false, error: msg }, msg === "farcaster_fid_taken" ? 409 : 500);
        }
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
