import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingHealthGet } = await import("@/server/x402-trading");
        return handleTradingHealthGet(request);
      },
    },
  },
  component: () => null,
});
