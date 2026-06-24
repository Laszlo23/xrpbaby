import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { checkRateLimit, readJsonBody } from "@/server/platform/rate-limit";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  returnPath: z.string().optional(),
  email: z.string().email().optional(),
});

export const Route = createFileRoute("/api/billing/stripe/subscribe")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "stripe-subscribe", 10);
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

        const { createCultureMonthlyCheckout } =
          await import("@/server/billing/stripe-subscriptions");
        const result = await createCultureMonthlyCheckout(parsed.data);

        if (!result.ok) {
          const status =
            result.error === "stripe_not_configured"
              ? 503
              : result.error === "invalid_wallet"
                ? 400
                : 503;
          return json({ ok: false, error: result.error }, status);
        }

        return json(result);
      },
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const wallet = url.searchParams.get("wallet")?.trim();
        if (!wallet || !/^0x[a-fA-F0-9]{40}$/.test(wallet)) {
          return json({ ok: false, error: "invalid_wallet" }, 400);
        }

        const { getCultureSubscriptionForWallet } =
          await import("@/server/billing/stripe-subscriptions");
        const sub = await getCultureSubscriptionForWallet(wallet);

        return json({
          ok: true,
          active: Boolean(sub),
          subscription: sub
            ? {
                id: sub.id,
                status: sub.status,
                productId: sub.productId,
                currentPeriodEnd: sub.currentPeriodEnd?.toISOString() ?? null,
              }
            : null,
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
