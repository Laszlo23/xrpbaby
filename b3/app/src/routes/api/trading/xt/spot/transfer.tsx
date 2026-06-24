import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/transfer")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleXtSpotTransferPost } = await import("@/server/x402-xt-trading");
        return handleXtSpotTransferPost(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
