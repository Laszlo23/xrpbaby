import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/manifest")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleXtManifestGet } = await import("@/server/x402-xt-trading");
        return handleXtManifestGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
