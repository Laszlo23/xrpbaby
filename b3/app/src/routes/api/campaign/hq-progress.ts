import { createFileRoute } from "@tanstack/react-router";
import { getHqFundraiseProgress } from "@/server/campaign/fundraise-progress";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/campaign/hq-progress")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({
            ok: true,
            raisedUsd: 0,
            raisedCents: 0,
            goalUsd: 77_777,
            percent: 0,
            purchaseCount: 0,
          });
        }
        const progress = await getHqFundraiseProgress(prisma);
        return json(progress);
      },
    },
  },
});
