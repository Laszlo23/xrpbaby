import { createFileRoute } from "@tanstack/react-router";
import { requireOpsDashboardSecret } from "@/server/platform/admin-secret";
import { merchOrdersDashboard } from "@/server/marketplace/merch-orders";

export const Route = createFileRoute("/api/marketplace/merch/dashboard")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const gate = requireOpsDashboardSecret(request);
        if (!gate.ok) {
          return Response.json({ ok: false, error: gate.error }, { status: gate.status });
        }
        const data = await merchOrdersDashboard();
        return Response.json(data);
      },
    },
  },
  component: () => null,
});
