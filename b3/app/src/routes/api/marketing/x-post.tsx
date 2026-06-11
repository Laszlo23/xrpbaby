import { createFileRoute } from "@tanstack/react-router";

import { getTwitterUserClient } from "@/server/x/twitter-client";
import { parseMarketingPostBody } from "@/server/x/resolve-social-media";
import { postMarketingTweet } from "@/server/x/post-marketing-tweet";

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

        const parsed = parseMarketingPostBody(body);
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

        const result = await postMarketingTweet(client, parsed.text, {
          replyToTweetId: parsed.replyToTweetId,
          imagePath: parsed.imagePath,
        });
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
            imagePath: parsed.imagePath ?? null,
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
        <span className="text-zinc-300">
          {'{ "text": string, "replyToTweetId"?: string, "imagePath"?: string }'}
        </span>
        . Header <span className="text-zinc-300">x-x-marketing-admin-secret</span> must match{" "}
        <span className="text-zinc-300">X_MARKETING_ADMIN_SECRET</span>. Uses the same OAuth user as
        X quest verification. Optional <span className="text-zinc-300">imagePath</span> must be
        site-relative under <span className="text-zinc-300">/social/</span>.
      </p>
    </div>
  );
}
