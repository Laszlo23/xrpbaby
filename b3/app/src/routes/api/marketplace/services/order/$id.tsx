import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/marketplace/services/order/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const { handleServiceOrderGet } = await import("@/server/marketplace/service-checkout");
        const id = params?.id;
        if (!id) {
          return new Response(JSON.stringify({ ok: false, error: "missing_id" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        return handleServiceOrderGet(request, id);
      },
    },
  },
  component: () => null,
});
