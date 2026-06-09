import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/grant/verification")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        try {
          const { handleGrantVerificationGet } = await import("@/server/grant-verification");
          return handleGrantVerificationGet(request);
        } catch (e) {
          const message = e instanceof Error ? e.message : "grant_verification_unavailable";
          return new Response(JSON.stringify({ ok: false, error: message }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }
      },
    },
  },
  component: () => null,
});
