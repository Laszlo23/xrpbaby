import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { createPartnerDeal, listPartnerDeals } from "@/server/partner-deals";

const createBodySchema = z.object({
  metadata: z.record(z.unknown()),
  metadataUri: z.string().url().optional(),
});

export const Route = createFileRoute("/api/partner-deals/")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const payerWallet = url.searchParams.get("payer") ?? undefined;
        const providerWallet = url.searchParams.get("provider") ?? undefined;
        const result = await listPartnerDeals({ payerWallet, providerWallet });
        if (!result.ok) return json({ ok: false, error: result.error }, 503);
        return json({ ok: true, deals: result.deals });
      },
      POST: async ({ request }) => {
        const body = await request.json().catch(() => null);
        const parsed = createBodySchema.safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const result = await createPartnerDeal({
          metadata: parsed.data.metadata as never,
          metadataUri: parsed.data.metadataUri,
        });
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
