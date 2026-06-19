import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/member/culture-power")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "no_database" }, 503);
        }

        const url = new URL(request.url);
        const parsed = querySchema.safeParse({ address: url.searchParams.get("address") });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const { getMemberPowerQuote } = await import("@/server/member/culture-power");
        const power = await getMemberPowerQuote(prisma, parsed.data.address);

        return json({
          ok: true,
          enabled: power.enabled,
          power: {
            score: power.powerScore,
            multiplierLabel: power.powerMultiplierLabel,
            effectiveMultiplierBps: power.effectiveMultiplierBps,
            maintenanceDueAt: power.maintenanceDueAt,
            streakDays: power.streakDays,
            daysIdle: power.daysIdle,
            dimensions: power.dimensions,
          },
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=30",
    },
  });
}
