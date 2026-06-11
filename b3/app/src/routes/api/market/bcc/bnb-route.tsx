import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/bcc/bnb-route")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleMarketBccBnbRouteGet } = await import("@/server/bcc-bnb-route");
        return handleMarketBccBnbRouteGet(request);
      },
    },
  },
});
