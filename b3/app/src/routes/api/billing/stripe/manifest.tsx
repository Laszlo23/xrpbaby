import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/billing/stripe/manifest")({
  server: {
    handlers: {
      GET: async () => {
        const { buildStripeManifestPayload } = await import("@/server/billing/stripe-manifest");
        return Response.json(await buildStripeManifestPayload());
      },
    },
  },
  component: () => null,
});
