import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  event: z.string().min(1).max(128),
  section: z.string().max(128).optional(),
  meta: z.record(z.unknown()).optional(),
});

export const Route = createFileRoute("/api/platform/analytics")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "analytics", 120);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const raw = await readJsonBody(request, 8192);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (prisma) {
          const { logActivity } = await import("@/server/platform/member");
          await logActivity(prisma, {
            type: `analytics:${parsed.data.event}`,
            sourceModule: "onboarding",
            payload: {
              section: parsed.data.section,
              ...parsed.data.meta,
            },
          });
        }
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
