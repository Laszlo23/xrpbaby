import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesHistoryGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesHistoryGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
