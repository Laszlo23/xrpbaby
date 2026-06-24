import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtHealthGet } = await import("@/server/x402-xt-trading");
        return handleXtHealthGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
