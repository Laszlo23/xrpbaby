import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/open")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleXtFuturesOpenPost } = await import("@/server/x402-xt-trading");
        return handleXtFuturesOpenPost(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
