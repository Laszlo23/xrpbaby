import { createFileRoute } from "@tanstack/react-router";

import { fetchCultureIdentityGraphFromIdentity } from "@/server/identity/web3bio";

const DEFAULT_DEMO_IDENTITY = "laszloleonardo.eth";

export const Route = createFileRoute("/api/identity/graph-demo")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const identity =
          url.searchParams.get("identity")?.trim() ||
          process.env.VITE_LANDING_GRAPH_IDENTITY?.trim() ||
          DEFAULT_DEMO_IDENTITY;

        const graph = await fetchCultureIdentityGraphFromIdentity(identity);
        return json({ ok: true, identity, graph });
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
      "Cache-Control": "public, max-age=600",
    },
  });
}
