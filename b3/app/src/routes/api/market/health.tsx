import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/health")({
  server: {
    handlers: {
      GET: async () => {
        const { handleMarketHealthGet } = await import("@/server/market-api");
        return handleMarketHealthGet();
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
