import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/ticker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesTickerGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesTickerGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
