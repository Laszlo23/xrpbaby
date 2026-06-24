import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { councilOverrideRuling } from "@/server/partner-deals";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  payoutBps: z.number().int().min(0).max(10_000),
  reasoning: z.string().min(1),
  calldataOnly: z.boolean().optional(),
});

export const Route = createFileRoute("/api/partner-deals/$id/override")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const dealId = params?.id;
        if (!dealId) return json({ ok: false, error: "missing_id" }, 400);

        const body = await request.json().catch(() => null);
        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const result = await councilOverrideRuling({
          dealId,
          walletAddress: parsed.data.walletAddress,
          payoutBps: parsed.data.payoutBps,
          reasoning: parsed.data.reasoning,
          submitCalldataOnly: parsed.data.calldataOnly ?? true,
        });
        if (!result.ok) {
          const status = result.error === "forbidden" ? 403 : 400;
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
