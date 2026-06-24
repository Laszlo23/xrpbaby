import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/balance")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtSpotBalanceGet } = await import("@/server/x402-xt-trading");
        return handleXtSpotBalanceGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
