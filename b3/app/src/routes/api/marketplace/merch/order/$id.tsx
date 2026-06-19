import { createFileRoute } from "@tanstack/react-router";
import { handleMerchOrderGet } from "@/server/marketplace/merch-checkout";

export const Route = createFileRoute("/api/marketplace/merch/order/$id")({
  server: {
    handlers: {
      GET: async ({ request, params }) => {
        const id = params?.id;
        if (!id) {
          return new Response(JSON.stringify({ ok: false, error: "missing_id" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        return handleMerchOrderGet(request, id);
      },
    },
  },
  component: () => null,
});
