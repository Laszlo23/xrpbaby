import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";

import { BCC_BRAND_QUEST_MIN_WEI } from "@/lib/brand-quest-config";
import { getBrandQuestEligibility } from "@/server/brand-quests/eligibility";

const querySchema = z.object({
  address: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/brand-quests/eligibility")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const parsed = querySchema.safeParse({ address: url.searchParams.get("address") });
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_address" }, 400);
        }

        const result = await getBrandQuestEligibility(
          parsed.data.address.toLowerCase() as `0x${string}`,
        );

        return json({
          ok: true,
          ...result,
          minWei: BCC_BRAND_QUEST_MIN_WEI.toString(),
        });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "private, max-age=30" },
  });
}
