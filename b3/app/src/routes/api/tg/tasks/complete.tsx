import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";
import { completeTelegramTask } from "@/server/tg/complete-task";

const bodySchema = z.object({
  taskId: z.string().min(1).max(64),
  moodId: z.string().max(32).optional(),
  quizAnswerId: z.string().max(8).optional(),
  thanksPreset: z.string().max(500).optional(),
});

export const Route = createFileRoute("/api/tg/tasks/complete")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-task-complete", 90);
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

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });

        const result = await completeTelegramTask(prisma, member.id, member.walletId, parsed.data);
        if (!result.ok) return json({ ok: false, error: result.error }, result.status);

        return json({
          ok: true,
          xpGranted: result.xpGranted,
          streakDays: result.streakDays,
          progression: result.progression,
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
