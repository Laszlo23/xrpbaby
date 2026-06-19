import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/marketplace/merch/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const { handleMerchCatalogGet } = await import("@/server/marketplace/merch-checkout");
        return handleMerchCatalogGet();
      },
    },
  },
  component: () => null,
});
