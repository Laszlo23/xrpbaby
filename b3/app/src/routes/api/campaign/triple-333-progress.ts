import { createFileRoute } from "@tanstack/react-router";
import { getTriple333Progress } from "@/server/campaign/fundraise-progress";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

export const Route = createFileRoute("/api/campaign/triple-333-progress")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({
            ok: true,
            ticketsSold: 0,
            ticketGoal: 333,
            percent: 0,
            purchaseCount: 0,
          });
        }
        const progress = await getTriple333Progress(prisma);
        return json(progress);
      },
    },
  },
});
