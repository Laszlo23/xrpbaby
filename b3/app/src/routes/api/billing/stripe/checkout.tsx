import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  sku: z.string().min(1),
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  returnPath: z.string().optional(),
});

export const Route = createFileRoute("/api/billing/stripe/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "stripe-api-checkout", 20);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const raw = await readJsonBody(request);
        if (!raw.ok) {
          return json({ ok: false, error: raw.error }, raw.status);
        }
        const parsed = bodySchema.safeParse(raw.body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const { createApiCheckoutSession } = await import("@/server/billing/stripe-api-checkout");
        const result = await createApiCheckoutSession({
          sku: parsed.data.sku,
          wallet: parsed.data.walletAddress,
          returnPath: parsed.data.returnPath,
        });

        if (!result.ok) {
          const status =
            result.error === "stripe_not_configured"
              ? 503
              : result.error === "unknown_sku"
                ? 400
                : 503;
          return json({ ok: false, error: result.error }, status);
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
