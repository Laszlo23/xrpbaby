import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  message: z.string().min(10),
  signature: z.string().min(10),
});

export const Route = createFileRoute("/api/points/weekly-claim/")({
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

        const { claimWeeklyBcc } = await import("@/server/points/weekly-claim");
        const result = await claimWeeklyBcc(prisma, {
          address: auth.address,
        });

        if (!result.ok) {
          const status =
            result.error === "insufficient_points" ||
            result.error === "cooldown_active" ||
            result.error === "weekly_claim_not_ready" ||
            result.error === "not_on_payout_whitelist"
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
