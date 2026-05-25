import { createFileRoute } from "@tanstack/react-router";

import { getTwitterUserClient } from "@/server/x/twitter-client";
import { postMarketingTweet } from "@/server/x/post-marketing-tweet";

const bodySchema = (raw: unknown): { text: string; replyToTweetId?: string } | null => {
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  if (typeof o.text !== "string") return null;
  const replyToTweetId =
    typeof o.replyToTweetId === "string" && o.replyToTweetId.trim()
      ? o.replyToTweetId.trim()
      : undefined;
  return { text: o.text, replyToTweetId };
};

export const Route = createFileRoute("/api/marketing/x-post")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const expected = process.env.X_MARKETING_ADMIN_SECRET?.trim();
        if (!expected) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }
        const hdr = request.headers.get("x-x-marketing-admin-secret");
        if (hdr !== expected) {
          return new Response(JSON.stringify({ ok: false, error: "unauthorized" }), {
            status: 401,
            headers: { "Content-Type": "application/json" },
          });
        }

        let body: unknown;
        try {
          body = await request.json();
        } catch {
          return new Response(JSON.stringify({ ok: false, error: "invalid_json" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const parsed = bodySchema(body);
        if (!parsed) {
          return new Response(JSON.stringify({ ok: false, error: "invalid_body" }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        const client = getTwitterUserClient();
        if (!client) {
          return new Response(JSON.stringify({ ok: false, error: "x_client_unconfigured" }), {
            status: 503,
            headers: { "Content-Type": "application/json" },
          });
        }

        const result = await postMarketingTweet(client, parsed.text, parsed.replyToTweetId);
        if (!result.ok) {
          return new Response(JSON.stringify({ ok: false, error: result.error }), {
            status: 400,
            headers: { "Content-Type": "application/json" },
          });
        }

        return new Response(
          JSON.stringify({
            ok: true,
            tweetId: result.tweetId,
            url: result.url,
          }),
          { headers: { "Content-Type": "application/json" } },
        );
      },
    },
  },
  component: XPostNote,
});

function XPostNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">POST /api/marketing/x-post</p>
      <p>
        JSON body:{" "}
        <span className="text-zinc-300">{'{ "text": string, "replyToTweetId"?: string }'}</span>.
        Header <span className="text-zinc-300">x-x-marketing-admin-secret</span> must match{" "}
        <span className="text-zinc-300">X_MARKETING_ADMIN_SECRET</span>. Uses the same OAuth user as
        X quest verification.
      </p>
    </div>
  );
}
