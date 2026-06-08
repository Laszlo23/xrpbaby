import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";

const bodySchema = z.object({
  walletAddress: z.string().min(8).max(128),
  walletApp: z.string().min(1).max(64).optional(),
});

export const Route = createFileRoute("/api/tg/wallet/ton-connected")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-ton-connected", 90);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const rawBody = await readJsonBody(request, 8192);
        if (!rawBody.ok) return json({ ok: false, error: rawBody.error }, rawBody.status);
        const parsed = bodySchema.safeParse(rawBody.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user);
        await prisma.activityEvent.create({
          data: {
            memberId: member.id,
            type: "tg:ton_wallet_connected",
            sourceModule: "telegram",
            payload: {
              walletAddress: parsed.data.walletAddress,
              walletApp: parsed.data.walletApp ?? null,
            },
          },
        });

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
