import { createFileRoute } from "@tanstack/react-router";

import { ensureGrowthApps, resolveAppBySlug } from "@/server/growth-intelligence/seed";

export const Route = createFileRoute("/api/intelligence/insights")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("app") ?? "bc-id";
        const kind = url.searchParams.get("kind") ?? "daily";
        const limit = Math.min(50, Number(url.searchParams.get("limit") ?? "20"));

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) {
          return json({ ok: false, error: "db_unavailable" }, 503);
        }

        await ensureGrowthApps(prisma);
        const app = await resolveAppBySlug(prisma, slug);
        if (!app) {
          return json({ ok: false, error: "unknown_app" }, 404);
        }

        const insights = await prisma.growthInsight.findMany({
          where: { appId: app.id, kind },
          orderBy: { createdAt: "desc" },
          take: limit,
        });

        return json({ ok: true, app: slug, insights });
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
