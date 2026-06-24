import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/withdraw")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleXtSpotWithdrawPost } = await import("@/server/x402-xt-trading");
        return handleXtSpotWithdrawPost(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
