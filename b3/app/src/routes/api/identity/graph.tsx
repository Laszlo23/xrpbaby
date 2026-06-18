import { createFileRoute } from "@tanstack/react-router";

import {
  fetchCultureIdentityGraphFromAddress,
  fetchCultureIdentityGraphFromIdentity,
} from "@/server/identity/web3bio";
import {
  getOrFetchIdentityGraph,
  getOrFetchIdentityGraphByIdentity,
} from "@/server/identity/enrichment-cache";

export const Route = createFileRoute("/api/identity/graph")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const address = url.searchParams.get("address")?.trim();
        const identity = url.searchParams.get("identity")?.trim();

        if (address) {
          const graph = await getOrFetchIdentityGraph(address, undefined, () =>
            fetchCultureIdentityGraphFromAddress(address),
          );
          return json({ ok: true, graph });
        }

        if (identity) {
          const graph = await getOrFetchIdentityGraphByIdentity(identity, () =>
            fetchCultureIdentityGraphFromIdentity(identity),
          );
          return json({ ok: true, graph });
        }

        return json({ ok: false, error: "missing_address_or_identity" }, 400);
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
