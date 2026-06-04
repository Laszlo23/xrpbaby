import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/config")({
  server: {
    handlers: {
      GET: async () => {
        const { handleMarketConfigGet } = await import("@/server/market-api");
        return handleMarketConfigGet();
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
