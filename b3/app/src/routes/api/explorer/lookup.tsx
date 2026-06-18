import { createFileRoute } from "@tanstack/react-router";

import { resolveCultureName } from "@/server/identity/resolve";
import { normalizeExplorerQuery } from "@/lib/explorer-query";
import { isEvmAddress, isTxHash } from "@/server/explorer/tx";

export const Route = createFileRoute("/api/explorer/lookup")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const url = new URL(request.url);
        const raw = url.searchParams.get("q") ?? "";
        const q = normalizeExplorerQuery(raw);
        if (!q) return json({ ok: false, error: "missing_query" }, 400);

        if (isTxHash(q)) {
          return json({ ok: true, type: "tx", hash: q });
        }
        if (isEvmAddress(q)) {
          return json({ ok: true, type: "address", address: q });
        }

        // Maybe a .culture name → resolve to the owner's address.
        const nameQuery = raw.trim().toLowerCase();
        if (nameQuery.includes(".") && nameQuery.length <= 80) {
          try {
            const resolved = await resolveCultureName(nameQuery);
            if (resolved.ok && resolved.status === "claimed" && resolved.owner) {
              return json({
                ok: true,
                type: "address",
                address: resolved.owner.toLowerCase(),
                resolvedName: resolved.fullName,
              });
            }
          } catch {
            // fall through to not_recognized
          }
        }

        return json(
          {
            ok: false,
            error: "not_recognized",
            hint: "Paste a transaction hash (66 characters starting with 0x), a wallet address (42 characters starting with 0x), or a .culture name.",
          },
          422,
        );
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", "Cache-Control": "no-store" },
  });
}
