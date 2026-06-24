import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { submitPartnerDealEvidence } from "@/server/partner-deals";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
  evidence: z.object({
    version: z.literal(1),
    dealId: z.number().int().positive(),
    dealMetadataHash: z.string().regex(/^0x[a-fA-F0-9]{64}$/),
    submittedAt: z.string(),
    submittedBy: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
    artifacts: z.array(
      z.object({
        type: z.string(),
        uri: z.string(),
        note: z.string().optional(),
      }),
    ),
    metrics: z.record(z.union([z.number(), z.string(), z.boolean()])),
  }),
  evidenceUri: z.string().optional(),
});

export const Route = createFileRoute("/api/partner-deals/$id/evidence")({
  server: {
    handlers: {
      POST: async ({ params, request }) => {
        const dealId = params?.id;
        if (!dealId) return json({ ok: false, error: "missing_id" }, 400);

        const body = await request.json().catch(() => null);
        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) return json({ ok: false, error: "invalid_body" }, 400);

        const result = await submitPartnerDealEvidence({
          dealId,
          walletAddress: parsed.data.walletAddress,
          evidence: parsed.data.evidence,
          evidenceUri: parsed.data.evidenceUri,
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
