import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/bcc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleMarketBccGet } = await import("@/server/market-api");
        return handleMarketBccGet(request);
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
