import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/quote-bcc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingQuoteBccGet } = await import("@/server/x402-trading");
        return handleTradingQuoteBccGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleTradingOptions } = await import("@/server/x402-trading");
        return handleTradingOptions(request);
      },
    },
  },
  component: () => null,
});
