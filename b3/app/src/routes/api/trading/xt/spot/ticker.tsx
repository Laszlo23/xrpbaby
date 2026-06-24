import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/ticker")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtSpotTickerGet } = await import("@/server/x402-xt-trading");
        return handleXtSpotTickerGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
