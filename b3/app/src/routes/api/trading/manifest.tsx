import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/manifest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingManifestGet } = await import("@/server/x402-trading");
        return handleTradingManifestGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleTradingOptions } = await import("@/server/x402-trading");
        return handleTradingOptions(request);
      },
    },
  },
  component: () => null,
});
