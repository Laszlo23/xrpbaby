import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/account")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesAccountGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesAccountGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
