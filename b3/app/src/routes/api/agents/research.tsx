import { createFileRoute } from "@tanstack/react-router";

/**
 * x402 research agent — manual test:
 *   curl -i "https://<origin>/api/agents/research?q=What+grants+fit+Base+AI+agents"
 * Paid: use thirdweb wrapFetchWithPayment or x402 client with payment header after 402.
 */
export const Route = createFileRoute("/api/agents/research")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleResearchX402Get } = await import("@/server/agents/research");
        return handleResearchX402Get(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleResearchOptions } = await import("@/server/agents/research");
        return handleResearchOptions(request);
      },
    },
  },
  component: ResearchApiNote,
});

function ResearchApiNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">Research agent (x402)</p>
      <p>
        GET with <span className="text-zinc-200">q</span> query param and x402 payment header.
        Price: <span className="text-zinc-200">X402_RESEARCH_PRICE</span> (default $0.05).
      </p>
    </div>
  );
}
