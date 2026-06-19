import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/marketplace/merch/pay")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleMerchPayGet } = await import("@/server/marketplace/merch-checkout");
        return handleMerchPayGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleMerchCheckoutOptions } = await import("@/server/marketplace/merch-checkout");
        return handleMerchCheckoutOptions(request);
      },
    },
  },
  component: () => null,
});
