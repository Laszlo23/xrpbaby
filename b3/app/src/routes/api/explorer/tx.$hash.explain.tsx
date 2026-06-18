import { createFileRoute } from "@tanstack/react-router";

import { explainTransaction } from "@/server/explorer/explain";
import { getTxFacts, isTxHash } from "@/server/explorer/tx";

/** Naive per-process rate limit — LLM calls are cached forever afterwards. */
const recentCalls: number[] = [];
const WINDOW_MS = 60_000;
const MAX_CALLS_PER_WINDOW = 20;

function rateLimited(): boolean {
  const now = Date.now();
  while (recentCalls.length > 0 && now - recentCalls[0] > WINDOW_MS) recentCalls.shift();
  if (recentCalls.length >= MAX_CALLS_PER_WINDOW) return true;
  recentCalls.push(now);
  return false;
}

export const Route = createFileRoute("/api/explorer/tx/$hash/explain")({
  server: {
    handlers: {
      POST: async ({ params }) => {
        const hash = params?.hash?.trim().toLowerCase() ?? "";
        if (!isTxHash(hash)) return json({ ok: false, error: "invalid_hash" }, 400);

        const result = await getTxFacts(hash);
        if (!result.ok) return json(result, 404);

        if (rateLimited()) return json({ ok: false, error: "rate_limited" }, 429);

        const explained = await explainTransaction(result.facts);
        if (!explained.ok) {
          return json(explained, explained.error === "llm_unavailable" ? 503 : 502);
        }
        return json({
          ok: true,
          explanation: explained.explanation,
          cached: explained.cached,
          model: explained.model,
        });
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
