import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/credentials/catalog")({
  server: {
    handlers: {
      GET: async () => {
        const { getCredentialCatalog } = await import("@/server/credentials/catalog");
        const catalog = await getCredentialCatalog();
        return Response.json({ ok: true, catalog });
      },
    },
  },
  component: () => null,
});
