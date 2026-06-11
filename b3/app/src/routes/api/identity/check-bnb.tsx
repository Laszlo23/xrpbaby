import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/identity/check-bnb")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleIdentityCheckBnbGet } = await import("@/server/identity/spaceid-resolve");
        return handleIdentityCheckBnbGet(request);
      },
    },
  },
});
