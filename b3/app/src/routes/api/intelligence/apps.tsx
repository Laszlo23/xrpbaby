import { createFileRoute } from "@tanstack/react-router";

import { ensureGrowthApps } from "@/server/growth-intelligence/seed";

export const Route = createFileRoute("/api/intelligence/apps")({
  server: {
    handlers: {
      GET: async () => {
        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "db_unavailable" }, 503);
        }

        await ensureGrowthApps(prisma);
        const apps = await prisma.growthApp.findMany({
          orderBy: { name: "asc" },
          select: { slug: true, name: true, domain: true, tier: true },
        });

        return json({ ok: true, apps });
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
