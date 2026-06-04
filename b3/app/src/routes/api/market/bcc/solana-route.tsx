import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/market/bcc/solana-route")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleMarketBccSolanaRouteGet } = await import("@/server/bcc-solana-route");
        return handleMarketBccSolanaRouteGet(request);
      },
      OPTIONS: async () => {
        const { handleMarketOptions } = await import("@/server/market-api");
        return handleMarketOptions();
      },
    },
  },
  component: () => null,
});
