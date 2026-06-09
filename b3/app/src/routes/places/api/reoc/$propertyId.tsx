import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/places/api/reoc/$propertyId")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const raw = params?.propertyId ?? "";
        const id = Number.parseInt(raw, 10);
        if (!Number.isFinite(id) || id < 1) {
          return json({ error: "invalid property id" }, 400);
        }

        const { buildReocMetadata } = await import("@/server/places/reoc-metadata");
        const meta = buildReocMetadata(id, request);
        if (!meta) {
          return json({ error: "property not found" }, 404);
        }

        return new Response(JSON.stringify(meta), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "public, max-age=300",
            "Access-Control-Allow-Origin": "*",
          },
        });
      },
    },
  },
  component: () => null,
});

function json(body: unknown, status: number) {
  return new Response(JSON.stringify(body), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
