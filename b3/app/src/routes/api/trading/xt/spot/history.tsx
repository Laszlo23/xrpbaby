import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/spot/history")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtSpotHistoryGet } = await import("@/server/x402-xt-trading");
        return handleXtSpotHistoryGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
