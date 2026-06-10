import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/platform/attribution-dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const secret = process.env.OPS_DASHBOARD_SECRET?.trim();
        if (secret) {
          const header = request.headers.get("x-ops-dashboard-secret")?.trim();
          const url = new URL(request.url);
          const query = url.searchParams.get("secret")?.trim();
          if (header !== secret && query !== secret) {
            return json({ ok: false, error: "unauthorized" }, 401);
          }
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
