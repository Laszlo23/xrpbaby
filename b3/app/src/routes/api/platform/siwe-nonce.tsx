import { createFileRoute } from "@tanstack/react-router";

import {
  createWalletAuthNonce,
  rememberNonce,
} from "@/server/platform/siwe";

export const Route = createFileRoute("/api/platform/siwe-nonce")({
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
