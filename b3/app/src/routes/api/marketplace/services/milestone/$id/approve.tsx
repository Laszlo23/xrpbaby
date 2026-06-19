import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { approveServiceMilestone } from "@/server/marketplace/service-orders";

const bodySchema = z.object({
  walletAddress: z.string().regex(/^0x[a-fA-F0-9]{40}$/),
});

export const Route = createFileRoute("/api/marketplace/services/milestone/$id/approve")({
  server: {
    handlers: {
      POST: async ({ request, params }) => {
        const milestoneId = params?.id;
        if (!milestoneId) {
          return json({ ok: false, error: "missing_id" }, 400);
        }

        const body = await request.json().catch(() => null);
        const parsed = bodySchema.safeParse(body);
        if (!parsed.success) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const result = await approveServiceMilestone(milestoneId, parsed.data.walletAddress);
        if (!result.ok) {
          const status = result.error === "forbidden" ? 403 : 404;
          return json({ ok: false, error: result.error }, status);
        }

        return json({
          ok: true,
          milestoneId: result.milestoneId,
          orderStatus: result.orderStatus,
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
