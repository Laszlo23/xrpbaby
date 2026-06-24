import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/klines")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesKlinesGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesKlinesGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
