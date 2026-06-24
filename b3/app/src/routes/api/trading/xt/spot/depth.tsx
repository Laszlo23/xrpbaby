import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/depth")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtSpotDepthGet } = await import("@/server/x402-xt-trading");
        return handleXtSpotDepthGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
