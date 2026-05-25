import { createFileRoute } from "@tanstack/react-router";
import { sitemapXmlResponse } from "@/server/sitemap-xml";

export const Route = createFileRoute("/sitemap.xml")({
  server: {
    handlers: {
      GET: async () => sitemapXmlResponse(),
    },
  },
  component: () => null,
});
