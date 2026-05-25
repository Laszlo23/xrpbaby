import { createFileRoute } from "@tanstack/react-router";

import { resolveCultureName } from "@/server/identity/resolve";

export const Route = createFileRoute("/api/identity/resolve")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const name = url.searchParams.get("name")?.trim();
        if (!name) {
          return json({ ok: false, error: "missing_name" }, 400);
        }
        const result = await resolveCultureName(name);
        return json(result);
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
      "Cache-Control": "public, max-age=15",
    },
  });
}
