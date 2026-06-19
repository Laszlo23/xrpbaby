import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/health")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { handleTradingHealthGet } = await import("@/server/x402-trading");
          return handleTradingHealthGet(request);
        } catch (e) {
          const message = e instanceof Error ? e.message : "trading_health_unavailable";
          return new Response(JSON.stringify({ ok: false, reachable: false, error: message }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
  component: () => null,
});
