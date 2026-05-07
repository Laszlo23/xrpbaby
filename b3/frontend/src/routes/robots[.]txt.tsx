import { createFileRoute } from "@tanstack/react-router";
import { getServerPublicOrigin } from "@/lib/app-origin";

/** Literal path `/robots.txt` (see `sitemap[.]xml.tsx` for the same dot-in-segment pattern). */
export const Route = createFileRoute("/robots.txt")({
  server: {
    handlers: {
      GET: async () => {
        const origin = getServerPublicOrigin().replace(/\/$/, "");
        const body = [
          "User-agent: *",
          "Allow: /",
          "Disallow: /admin",
          "",
          `Sitemap: ${origin}/sitemap.xml`,
          "",
        ].join("\n");
        return new Response(body, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "public, max-age=3600",
          },
        });
      },
    },
  },
  component: () => null,
});
