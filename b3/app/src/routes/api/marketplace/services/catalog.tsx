import { createFileRoute } from "@tanstack/react-router";
import { getServerPublicOrigin } from "@/lib/app-origin";
import { servicesCatalogManifest } from "@/content/marketplace-services";

export const Route = createFileRoute("/api/marketplace/services/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const base = getServerPublicOrigin();
        return Response.json(servicesCatalogManifest(base));
      },
    },
  },
  component: () => null,
});
