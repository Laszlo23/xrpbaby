import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/points/redeem/stats")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const { getRedeemStats } = await import("@/server/points/redeem");
        const stats = await getRedeemStats(prisma);
        return json(stats);
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
