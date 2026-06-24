import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/positions")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesPositionsGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesPositionsGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
