import { createFileRoute } from "@tanstack/react-router";
import { serviceOrdersDashboard } from "@/server/marketplace/service-orders";

export const Route = createFileRoute("/api/marketplace/services/dashboard")({
  server: {
    handlers: {
      GET: async () => {
        const data = await serviceOrdersDashboard();
        return Response.json(data);
      },
    },
  },
  component: () => null,
});
