import { createFileRoute } from "@tanstack/react-router";

import { getExplorerFeed } from "@/server/explorer/feed";

export const Route = createFileRoute("/api/explorer/feed")({
  server: {
    handlers: {
      GET: async () => {
        const feed = await getExplorerFeed();
        return json(feed, feed.ok ? 200 : 502, { "Cache-Control": "public, max-age=20" });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}
