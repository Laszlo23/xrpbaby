import { createFileRoute } from "@tanstack/react-router";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { waitlistBodySchema } from "@/server/platform/schemas";

const bodySchema = waitlistBodySchema;

export const Route = createFileRoute("/api/platform/waitlist")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "waitlist", 10);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const raw = await readJsonBody(request, 4096);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const email = parsed.data.email.toLowerCase();
        await prisma.waitlistEntry.upsert({
          where: { email },
          create: {
            email,
            name: parsed.data.name,
            role: parsed.data.role,
            source: parsed.data.source ?? "landing",
          },
          update: {
            name: parsed.data.name ?? undefined,
            role: parsed.data.role ?? undefined,
            source: parsed.data.source ?? undefined,
          },
        });
        const { logActivity } = await import("@/server/platform/member");
        await logActivity(prisma, {
          type: "waitlist_join",
          sourceModule: "onboarding",
          payload: { email, source: parsed.data.source },
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
