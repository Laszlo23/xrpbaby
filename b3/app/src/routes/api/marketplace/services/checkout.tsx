import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/marketplace/services/checkout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const { handleServiceCheckoutPost } = await import("@/server/marketplace/service-checkout");
        return handleServiceCheckoutPost(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleServiceCheckoutOptions } =
          await import("@/server/marketplace/service-checkout");
        return handleServiceCheckoutOptions(request);
      },
    },
  },
  component: () => null,
});
