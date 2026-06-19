import { createFileRoute } from "@tanstack/react-router";
import { handleMerchOrdersGet } from "@/server/marketplace/merch-checkout";

export const Route = createFileRoute("/api/marketplace/merch/orders")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        return handleMerchOrdersGet(request);
      },
    },
  },
  component: () => null,
});
