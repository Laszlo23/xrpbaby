import { createFileRoute } from "@tanstack/react-router";

import { resolveCultureName } from "@/server/identity/resolve";
import { getCultureIdentityEnrichment } from "@/server/identity/showcase-enrichment";

export const Route = createFileRoute("/api/identity/enrich")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name")?.trim();
        if (!name) {
          return json({ ok: false, error: "missing_name" }, 400);
        }
        const resolved = await resolveCultureName(name);
        if (resolved.status !== "claimed") {
          return json({ ok: false, error: "not_claimed", status: resolved.status }, 404);
        }
        const enrichment = await getCultureIdentityEnrichment(resolved);
        return json({ ok: true, resolved, enrichment });
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "public, max-age=300",
    },
  });
}
