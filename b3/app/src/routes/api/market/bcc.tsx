import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/bcc")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { handleMarketBccGet } = await import("@/server/market-api");
          return handleMarketBccGet(request);
        } catch (e) {
          const message = e instanceof Error ? e.message : "market_bcc_unavailable";
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
