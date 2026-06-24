import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/billing/stripe/health")({
  server: {
    handlers: {
      GET: async () => {
        const { buildStripeHealthPayload } = await import("@/server/billing/stripe-health");
        return Response.json(buildStripeHealthPayload());
      },
    },
  },
  component: () => null,
});
