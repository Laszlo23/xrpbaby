import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/listings")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleMarketListingsGet } = await import("@/server/market-api");
        return handleMarketListingsGet(request);
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
