import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/marketplace/services/pay")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleServicePayGet } = await import("@/server/marketplace/service-checkout");
        return handleServicePayGet(request);
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
