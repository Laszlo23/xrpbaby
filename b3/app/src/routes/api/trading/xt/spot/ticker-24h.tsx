import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/ticker-24h")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtSpotTicker24hGet } = await import("@/server/x402-xt-trading");
        return handleXtSpotTicker24hGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
