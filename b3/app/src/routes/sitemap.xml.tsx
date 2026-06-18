import { createFileRoute } from "@tanstack/react-router";

/** Legacy path — redirect to canonical `/sitemap.xml`. */
export const Route = createFileRoute("/sitemap/xml")({
  server: {
    handlers: {
      GET: async () =>
        new Response(null, {
          status: 301,
          headers: { Location: "/sitemap.xml" },
        }),
    },
  },
  component: () => null,
});
