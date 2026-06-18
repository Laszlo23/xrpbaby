import { createFileRoute } from "@tanstack/react-router";

import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";

export const Route = createFileRoute("/api/platform/attribution-dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) {
          return json({ ok: false, error: gate.error }, gate.status);
        }

        const { getPrisma } = await import("@/server/db/prisma");
        const prisma = getPrisma();
        if (!prisma) return json({ ok: false, error: "no_database" }, 503);

        const { getAttributionDashboard } = await import("@/server/platform/attribution-dashboard");
        const data = await getAttributionDashboard(prisma);
        return json(data);
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "private, max-age=120",
    },
  });
}
