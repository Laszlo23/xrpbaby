import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/identity/resolve-bnb")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleIdentityResolveBnbGet } = await import("@/server/identity/spaceid-resolve");
        return handleIdentityResolveBnbGet(request);
      },
    },
  },
});
