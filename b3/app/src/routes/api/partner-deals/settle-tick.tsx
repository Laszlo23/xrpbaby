import { createFileRoute } from "@tanstack/react-router";
import { settleEligiblePartnerDeals } from "@/server/partner-deals";

export const Route = createFileRoute("/api/partner-deals/settle-tick")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const secret = process.env.SERVICE_DEAL_CRON_SECRET?.trim();
        if (secret) {
          const auth = request.headers.get("authorization") ?? "";
          if (auth !== `Bearer ${secret}`) {
            return json({ ok: false, error: "unauthorized" }, 401);
          }
        }

        const result = await settleEligiblePartnerDeals();
        if (!result.ok) return json(result, 503);
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
