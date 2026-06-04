import { createFileRoute } from "@tanstack/react-router";
import { checkRateLimit } from "@/server/platform/rate-limit";
import { verifyPrivyAccessToken } from "@/server/wallet/privy-auth";

export const Route = createFileRoute("/api/wallet/logout")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const limited = checkRateLimit(request, "wallet-logout", 30);
        if (!limited.ok) {
          return json({ ok: false, error: "rate_limited" }, 429);
        }

        const auth = await verifyPrivyAccessToken(request.headers.get("authorization"));
        if (!("userId" in auth)) {
          return json({ ok: false, error: auth.error }, auth.status);
        }

        // Privy server-auth SDK has no global session revoke; client logout on hub clears origin session.
        // This endpoint validates the token and acks logout for satellites + audit hooks.
        return json({ ok: true, privyUserId: auth.userId });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
