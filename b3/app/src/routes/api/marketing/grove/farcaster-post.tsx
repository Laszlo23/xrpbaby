import { createFileRoute } from "@tanstack/react-router";

import { groveMarketingAdminSecret } from "@/server/marketing/grove/env";
import { postGroveFarcasterCast } from "@/server/marketing/grove/farcaster-post";

export const Route = createFileRoute("/api/marketing/grove/farcaster-post")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = groveMarketingAdminSecret();
        if (!expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }
        const hdr =
          request.headers.get("x-grove-marketing-admin-secret") ||
          request.headers.get("x-x-marketing-admin-secret");
        if (hdr !== expected) {
          return json({ ok: false, error: "unauthorized" }, 401);
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return json({ ok: false, error: "invalid_json" }, 400);
        }

        if (
          !body ||
          typeof body !== "object" ||
          typeof (body as { text?: unknown }).text !== "string"
        ) {
          return json({ ok: false, error: "invalid_body" }, 400);
        }

        const result = await postGroveFarcasterCast((body as { text: string }).text);
        if (!result.ok) return json({ ok: false, error: result.error }, 400);

        return json({ ok: true, hash: result.hash, url: result.url });
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
