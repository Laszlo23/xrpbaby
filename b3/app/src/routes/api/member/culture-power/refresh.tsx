import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

const bodySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  message: z.string().min(1),
  signature: z.string().min(1),
});

export const Route = createFileRoute("/api/member/culture-power/refresh")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return Response.json({ ok: false, error: "invalid_json" }, { status: 400 });
        }

        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return Response.json({ ok: false, error: "invalid_body" }, { status: 400 });
        }

        const { requireSiweAuth } = await import("@/server/platform/siwe");
        const auth = await requireSiweAuth(parsed.data);
        if ("error" in auth) {
          return Response.json({ ok: false, error: auth.error }, { status: auth.status });
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return Response.json({ ok: false, error: "no_database" }, { status: 503 });
        }

        const { refreshMemberPower } = await import("@/server/member/culture-power");
        const power = await refreshMemberPower(prisma, auth.address);
        if (!power) {
          return Response.json({ ok: false, error: "power_disabled" }, { status: 503 });
        }

        return Response.json({
          ok: true,
          power: {
            score: power.powerScore,
            multiplierLabel: power.powerMultiplierLabel,
            streakDays: power.streakDays,
            dimensions: power.dimensions,
          },
        });
      },
    },
  },
  component: () => null,
});
