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
        const networkParam = url.searchParams.get("network")?.trim().toLowerCase();
        const networkId =
          networkParam === "bsc"
            ? ("bsc" as const)
            : networkParam === "base"
              ? ("base" as const)
              : undefined;
        const chainIdParam = url.searchParams.get("chainId");
        const networkFromChain =
          chainIdParam === "56"
            ? ("bsc" as const)
            : chainIdParam === "8453"
              ? ("base" as const)
              : undefined;
        const result = await resolveCultureName(name, networkId ?? networkFromChain);
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
