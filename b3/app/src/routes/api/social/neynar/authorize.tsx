import { createFileRoute } from "@tanstack/react-router";
import { fetchNeynarAuthorizeUrl } from "@/server/neynar/client";

export const Route = createFileRoute("/api/social/neynar/authorize")({
  server: {
    handlers: {
      GET: async () => {
        try {
          const authorizationUrl = await fetchNeynarAuthorizeUrl();
          return json({ ok: true, authorization_url: authorizationUrl });
        } catch (e) {
          const msg = e instanceof Error ? e.message : "authorize_failed";
          return json({ ok: false, error: msg }, msg.includes("client_id") ? 503 : 502);
        }
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
