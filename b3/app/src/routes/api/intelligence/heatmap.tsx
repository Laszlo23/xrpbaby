import { createFileRoute } from "@tanstack/react-router";

import { computeClickHeatmap } from "@/server/growth-intelligence/heatmap";
import { ensureGrowthApps, resolveAppBySlug } from "@/server/growth-intelligence/seed";

export const Route = createFileRoute("/api/intelligence/heatmap")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const slug = url.searchParams.get("app") ?? "bc-id";
        const pathname = url.searchParams.get("pathname") ?? "/";
        const days = Number(url.searchParams.get("days") ?? "7");

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

        const heatmap = await computeClickHeatmap(prisma, app.id, pathname, days);
        return json({ ok: true, app: slug, heatmap });
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
