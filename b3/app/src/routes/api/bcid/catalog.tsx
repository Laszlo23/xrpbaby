import { createFileRoute } from "@tanstack/react-router";

import { BCID_CREDENTIAL_CATALOG } from "@/lib/bcid/bcid-catalog";

export const Route = createFileRoute("/api/bcid/catalog")({
  server: {
    handlers: {
      GET: async () => {
        return Response.json({
          ok: true,
          credentials: BCID_CREDENTIAL_CATALOG,
        });
      },
    },
  },
  component: () => null,
});
