import { createFileRoute } from "@tanstack/react-router";
import { evaluatePartnerDeal } from "@/server/partner-deals";

export const Route = createFileRoute("/api/partner-deals/$id/evaluate")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const dealId = params?.id;
        if (!dealId) return json({ ok: false, error: "missing_id" }, 400);

        const url = new URL(request.url);
        const submitOnChain = url.searchParams.get("dryRun") !== "1";

        const result = await evaluatePartnerDeal({ dealId, submitOnChain });
        if (!result.ok) return json(result, 400);
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
