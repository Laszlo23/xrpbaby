import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";
import { requireSiweAuth } from "@/server/platform/siwe";

const bodySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(10),
  signature: z.string().min(10),
  type: z.string().min(1).max(128),
  sourceModule: z.string().max(64).optional(),
  payload: z.record(z.unknown()).optional(),
});

export const Route = createFileRoute("/api/activity/log")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "activity-log", 60);
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

        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        const { ensureWalletAndMember, logActivity } = await import(
          "@/server/platform/member"
        );
        const { member } = await ensureWalletAndMember(prisma, auth.address);
        const event = await logActivity(prisma, {
          memberId: member.id,
          type: parsed.data.type,
          sourceModule: parsed.data.sourceModule,
          payload: parsed.data.payload,
        });
        return json({ ok: true, eventId: event.id });
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
