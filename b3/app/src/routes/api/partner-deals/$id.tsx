import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import {
  getPartnerDeal,
  getPartnerDealCalldata,
  markPartnerDealFunded,
} from "@/server/partner-deals";

const fundBodySchema = z.object({
  onChainDealId: z.string().regex(/^\d+$/),
  fundTxHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
  createTxHash: z
    .string()
    .regex(/^0x[a-fA-F0-9]{64}$/)
    .optional(),
});

export const Route = createFileRoute("/api/partner-deals/$id")({
  server: {
    handlers: {
      GET: async ({ params, request }) => {
        const dealId = params?.id;
        if (!dealId) return json({ ok: false, error: "missing_id" }, 400);

        const url = new URL(request.url);
        if (url.searchParams.get("calldata") === "1") {
          const calldata = await getPartnerDealCalldata(dealId);
          if (!calldata.ok) return json(calldata, 404);
          return json(calldata);
        }

        const deal = await getPartnerDeal(dealId);
        if (!deal) return json({ ok: false, error: "not_found" }, 404);
        return json({ ok: true, deal });
      },
      POST: async ({ params, request }) => {
        const dealId = params?.id;
        if (!dealId) return json({ ok: false, error: "missing_id" }, 400);

        const url = new URL(request.url);
        const action = url.searchParams.get("action");

        if (action === "fund") {
          const body = await request.json().catch(() => null);
          const parsed = fundBodySchema.safeParse(body);
          if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

          const result = await markPartnerDealFunded({
            dealId,
            onChainDealId: parsed.data.onChainDealId,
            fundTxHash: parsed.data.fundTxHash,
            createTxHash: parsed.data.createTxHash,
          });
          if (!result.ok) return json(result, 400);
          return json(result);
        }

        return json({ ok: false, error: "unknown_action" }, 400);
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
