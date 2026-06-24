import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/xt/futures/order/$orderId")({
  server: {
    handlers: {
      DELETE: async ({ request, params }) => {
        const { handleXtFuturesOrderDelete } = await import("@/server/x402-xt-trading");
        const orderId = params?.orderId;
        if (!orderId) {
          return Response.json({ error: "missing_order_id" }, { status: 400 });
        }
        return handleXtFuturesOrderDelete(request, orderId);
      },
      OPTIONS: async ({ request }) => {
        const { handleXtOptions } = await import("@/server/x402-xt-trading");
        return handleXtOptions(request);
      },
    },
  },
  component: () => null,
});
