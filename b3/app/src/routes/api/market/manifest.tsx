import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/manifest")({
  server: {
    handlers: {
      GET: async () => {
        const { handleMarketManifestGet } = await import("@/server/market-api");
        return handleMarketManifestGet();
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
