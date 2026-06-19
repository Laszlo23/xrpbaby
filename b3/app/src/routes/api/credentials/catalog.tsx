import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/credentials/catalog")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const { getCredentialCatalog } = await import("@/server/credentials/catalog");
          const catalog = await getCredentialCatalog();
          return Response.json({ ok: true, catalog });
        } catch (error) {
          console.warn("GET /api/credentials/catalog:", error);
          const { getStaticCredentialCatalog } =
            await import("@/lib/credentials/credential-catalog");
          return Response.json({ ok: true, catalog: getStaticCredentialCatalog() });
        }
      },
    },
  },
  component: () => null,
});
