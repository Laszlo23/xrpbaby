import { createFileRoute } from "@tanstack/react-router";
import { blogRssResponse } from "@/server/blog-rss";

export const Route = createFileRoute("/blog/feed.xml")({
  server: {
    handlers: {
      GET: async () => blogRssResponse(),
    },
  },
  component: () => null,
});
