import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/depth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesDepthGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesDepthGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
