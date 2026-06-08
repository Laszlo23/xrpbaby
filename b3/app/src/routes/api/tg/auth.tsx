import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember, getCulturePoints, progressionFromPoints } from "@/server/tg/member";

const bodySchema = z.object({
  initDataRaw: z.string().min(1).max(8192).optional(),
});

export const Route = createFileRoute("/api/tg/auth")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-auth", 60);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const rawBody = await readJsonBody(request, 16_384);
        if (!rawBody.ok) return json({ ok: false, error: rawBody.error }, rawBody.status);
        const parsed = bodySchema.safeParse(rawBody.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const auth = requireTelegramAuth(request, { initDataRaw: parsed.data.initDataRaw });
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);
        const initData = auth.initData;
        const maxAgeSec = Number(process.env.TELEGRAM_INITDATA_MAX_AGE_SEC ?? "3600");

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, initData.user, {
          allowSyntheticWallet: initData.hash === "dev",
        });
        const points = await getCulturePoints(prisma, member.walletId);
        const progression = progressionFromPoints(points);

        const { logActivity } = await import("@/server/platform/member");
        await logActivity(prisma, {
          memberId: member.id,
          type: "tg:auth_success",
          sourceModule: "telegram",
          payload: {
            telegramUserId: String(initData.user.id),
            username: initData.user.username,
          },
        });

        return json({
          ok: true,
          member: {
            id: member.id,
            walletAddress: member.walletAddress,
            telegramUserId: String(initData.user.id),
          },
          session: {
            expiresAt: new Date((initData.authDate + maxAgeSec) * 1000).toISOString(),
          },
          progression,
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
