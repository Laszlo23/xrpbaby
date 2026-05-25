import { createFileRoute } from "@tanstack/react-router";

import { verifyWorldWalletAuthJson } from "@/server/world/verify-world-wallet";

export const Route = createFileRoute("/api/world/wallet-verify")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }
        const result = await verifyWorldWalletAuthJson(body);
        return new Response(JSON.stringify(result.json), {
          status: result.status,
          headers: { "Content-Type": "application/json" },
        });
      },
    },
  },
  component: () => null,
});
