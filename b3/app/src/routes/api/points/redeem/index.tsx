import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
  points: z.number().int().positive().max(1_000_000),
  idempotencyKey: z.string().min(8).max(128),
});

export const Route = createFileRoute("/api/points/redeem/")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const raw = await readJsonBody(request);
        if (!raw.ok) return json({ ok: false, error: raw.error }, raw.status);
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const { requireSiweAuthFromMessage } = await import("@/server/platform/siwe");
        const auth = await requireSiweAuthFromMessage(parsed.data.message, parsed.data.signature);
        if ("error" in auth) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        const { redeemPointsForBcc } = await import("@/server/points/redeem");
        const result = await redeemPointsForBcc(prisma, {
          address: auth.address,
          points: parsed.data.points,
          idempotencyKey: parsed.data.idempotencyKey,
        });

        if (!result.ok) {
          const status =
            result.error === "insufficient_points" ||
            result.error === "daily_cap_exceeded" ||
            result.error === "redemption_not_ready"
              ? 400
              : 500;
          return json(result, status);
        }
        return json(result);
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
