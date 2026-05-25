import { createFileRoute } from "@tanstack/react-router";

import { createWalletAuthNonce, rememberNonce } from "@/server/world/nonce-store";

export const Route = createFileRoute("/api/world/wallet-nonce")({
  server: {
    handlers: {
      GET: async () => {
        const nonce = createWalletAuthNonce();
        rememberNonce(nonce);
        return new Response(JSON.stringify({ nonce }), {
          status: 200,
          headers: {
            "Content-Type": "application/json",
            "Cache-Control": "no-store",
          },
        });
      },
    },
  },
  component: () => null,
});
