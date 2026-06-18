import { createFileRoute } from "@tanstack/react-router";

import { getGrowthOverview } from "@/server/growth-intelligence/overview";
import { ensureGrowthApps, resolveAppBySlug } from "@/server/growth-intelligence/seed";
import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";

export const Route = createFileRoute("/api/intelligence/overview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) {
          return json({ ok: false, error: gate.error }, gate.status);
        }

        const url = new URL(request.url);
        const slug = url.searchParams.get("app") ?? "bc-id";
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

        const overview = await getGrowthOverview(prisma, app.id, days);
        return json({ ok: true, app: slug, overview });
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
