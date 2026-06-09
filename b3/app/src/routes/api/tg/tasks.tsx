import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { requireTelegramAuth } from "@/server/tg/auth-request";
import { ensureTelegramMember } from "@/server/tg/member";
import { CULTURE_QUIZ, MOOD_OPTIONS, THANKS_PRESETS, resolveTaskStatuses } from "@/server/tg/tasks";

export const Route = createFileRoute("/api/tg/tasks")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const limited = checkRateLimit(request, "tg-tasks", 120);
        if (!limited.ok) return json({ ok: false, error: "rate_limited" }, 429);

        const auth = requireTelegramAuth(request);
        if (!auth.ok) return json({ ok: false, error: auth.error }, auth.status);

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const member = await ensureTelegramMember(prisma, auth.initData.user, {
          allowSyntheticWallet: auth.initData.hash === "dev",
        });
        const tasks = await resolveTaskStatuses(prisma, member.id);

        return json({
          ok: true,
          tasks,
          moodOptions: MOOD_OPTIONS,
          thanksPresets: THANKS_PRESETS,
          quiz: CULTURE_QUIZ,
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
