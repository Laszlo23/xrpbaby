import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtSpotOrdersGet } = await import("@/server/x402-xt-trading");
        return handleXtSpotOrdersGet(request);
      },
      DELETE: async ({ request }) => {
        const { handleXtSpotOrdersDelete } = await import("@/server/x402-xt-trading");
        return handleXtSpotOrdersDelete(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
