import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/arbitrage-scan")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingArbitrageScanGet } = await import("@/server/x402-trading");
        return handleTradingArbitrageScanGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleTradingOptions } = await import("@/server/x402-trading");
        return handleTradingOptions(request);
      },
    },
  },
  component: () => null,
});
