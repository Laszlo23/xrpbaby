import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesOrdersGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesOrdersGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
