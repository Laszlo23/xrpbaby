import { createFileRoute } from "@tanstack/react-router";

/**
 * x402 Limx revenue agent — manual test:
 *   curl -i "https://<origin>/api/agents/limx?q=Base+grants+for+AI+community+products"
 * Settlement: LIMX_AGENT_WALLET_ADDRESS (default Blockchain0x Limx wallet on Base).
 */
export const Route = createFileRoute("/api/agents/limx")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleLimxX402Get } = await import("@/server/agents/limx");
        return handleLimxX402Get(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleLimxOptions } = await import("@/server/agents/limx");
        return handleLimxOptions(request);
      },
    },
  },
  component: LimxApiNote,
});

function LimxApiNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">Limx revenue agent (x402)</p>
      <p>
        GET with <span className="text-zinc-200">q</span> query param and x402 payment header.
        Price: <span className="text-zinc-200">X402_LIMX_PRICE</span> (default $0.25). USDC settles
        to the Limx agent wallet on Base.
      </p>
    </div>
  );
}
