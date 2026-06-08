import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/health")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { handleMarketHealthGet } = await import("@/server/market-api");
          return handleMarketHealthGet();
        } catch (e) {
          const message = e instanceof Error ? e.message : "market_health_unavailable";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
