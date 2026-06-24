import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/order")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleXtSpotOrderPost } = await import("@/server/x402-xt-trading");
        return handleXtSpotOrderPost(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
