import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/funding-rate")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtFuturesFundingRateGet } = await import("@/server/x402-xt-trading");
        return handleXtFuturesFundingRateGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
