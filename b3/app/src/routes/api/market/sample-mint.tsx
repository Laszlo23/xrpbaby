import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/sample-mint")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleMarketSampleMintGet } = await import("@/server/market-api");
        return handleMarketSampleMintGet(request);
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
