import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/swap-preview")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingSwapPreviewGet } = await import("@/server/x402-trading");
        return handleTradingSwapPreviewGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleTradingOptions } = await import("@/server/x402-trading");
        return handleTradingOptions(request);
      },
    },
  },
  component: () => null,
});
