import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/pools")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingPoolsGet } = await import("@/server/x402-trading");
        return handleTradingPoolsGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleTradingOptions } = await import("@/server/x402-trading");
        return handleTradingOptions(request);
      },
    },
  },
  component: () => null,
});
