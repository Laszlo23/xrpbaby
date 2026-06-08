import { createFileRoute } from "@tanstack/react-router";

import { groveMarketingAdminSecret } from "@/server/marketing/grove/env";
import { getGroveTwitterClient } from "@/server/marketing/grove/x-client";
import { postMarketingTweet } from "@/server/x/post-marketing-tweet";

export const Route = createFileRoute("/api/marketing/grove/x-post")({
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

        const parsed = parseBody(body);
        if (!parsed) return json({ ok: false, error: "invalid_body" }, 400);

        const client = getGroveTwitterClient();
        if (!client) return json({ ok: false, error: "x_client_unconfigured" }, 503);

        const result = await postMarketingTweet(client, parsed.text, parsed.replyToTweetId);
        if (!result.ok) return json({ ok: false, error: result.error }, 400);

        return json({ ok: true, tweetId: result.tweetId, url: result.url });
      },
    },
  },
  component: () => null,
});

function parseBody(raw: unknown): { text: string; replyToTweetId?: string } | null {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.text !== "string") return null;
  const replyToTweetId =
    typeof o.replyToTweetId === "string" && o.replyToTweetId.trim()
      ? o.replyToTweetId.trim()
      : undefined;
  return { text: o.text, replyToTweetId };
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
