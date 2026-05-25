import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/api/x402/premium")({
  server: {
    handlers: {
      GET: async ({ request }) => {
        const { handlePremiumX402Get } = await import("@/server/x402-premium");
        return handlePremiumX402Get(request);
      },

      OPTIONS: async ({ request }) => {
        const { handlePremiumOptions } = await import("@/server/x402-premium");
        return handlePremiumOptions(request);
      },
    },
  },
  component: PremiumApiNote,
});

function PremiumApiNote() {
  return (
    <div className="mx-auto max-w-lg px-4 py-16 font-mono text-sm text-muted-foreground">
      <p className="mb-2 font-semibold text-foreground">x402 endpoint — drop teaser feed</p>
      <p>
        GET with an x402 payment header (e.g. <span className="text-zinc-200">x-payment</span>).
        Successful settlement returns JSON <span className="text-zinc-200">feed:</span>{" "}
        <span className="text-zinc-200">buildchain_premium_drop_teasers_v1</span> with public drop
        metadata (slug, title, endsAt, …).
      </p>
      <p className="mt-2">
        Configure facilitator + price via server env (
        <span className="text-zinc-200">X402_PRICE</span>, thirdweb secret) — see{" "}
        <span className="text-zinc-200">server/x402-premium.ts</span>.
      </p>
    </div>
  );
}
