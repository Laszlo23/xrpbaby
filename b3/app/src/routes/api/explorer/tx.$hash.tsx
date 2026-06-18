import { createFileRoute } from "@tanstack/react-router";

import { getCachedExplanation } from "@/server/explorer/explain";
import { getTxFacts, isTxHash } from "@/server/explorer/tx";

export const Route = createFileRoute("/api/explorer/tx/$hash")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const hash = params?.hash?.trim().toLowerCase() ?? "";
        if (!isTxHash(hash)) return json({ ok: false, error: "invalid_hash" }, 400);

        const result = await getTxFacts(hash);
        if (!result.ok) return json(result, 404);

        const explanation = await getCachedExplanation(result.facts);
        return json(
          { ok: true, facts: result.facts, source: result.source, explanation },
          200,
          // Confirmed tx facts are immutable; pending ones may change.
          result.facts.status === "pending"
            ? { "Cache-Control": "no-store" }
            : { "Cache-Control": "public, max-age=60" },
        );
      },
    },
  },
  component: () => null,
});

function json(data: unknown, status = 200, extraHeaders?: Record<string, string>) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json", ...extraHeaders },
  });
}
