import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/marketplace/merch/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleMerchCheckoutPost } = await import("@/server/marketplace/merch-checkout");
        return handleMerchCheckoutPost(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleMerchCheckoutOptions } = await import("@/server/marketplace/merch-checkout");
        return handleMerchCheckoutOptions(request);
      },
    },
  },
  component: () => null,
});
