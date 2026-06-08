import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/trading/quote")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handleTradingQuoteGet } = await import("@/server/x402-trading");
        return handleTradingQuoteGet(request);
      },
      OPTIONS: async ({ request }) => {
        const { handleTradingOptions } = await import("@/server/x402-trading");
        return handleTradingOptions(request);
      },
    },
  },
  component: TradingQuoteApiNote,
});

function TradingQuoteApiNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">Rentable trading quote (x402)</p>
      <p>
        GET with query <span className="text-zinc-200">from_token</span>,{" "}
        <span className="text-zinc-200">to_token</span>,{" "}
        <span className="text-zinc-200">amount</span> and x402 payment header. Example:{" "}
        <span className="text-zinc-200">
          /api/trading/quote?from_token=eth&to_token=bcc&amount=0.01
        </span>
      </p>
      <p className="mt-2">
        Pricing: <span className="text-zinc-200">X402_TRADING_QUOTE_PRICE</span> (default $0.05).
        Manifest: <span className="text-zinc-200">/api/trading/manifest</span>.
      </p>
    </div>
  );
}
