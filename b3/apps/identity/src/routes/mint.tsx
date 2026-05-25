import { createFileRoute } from "@tanstack/react-router";
import { SearchMint } from "@/components/SearchMint";
import { RedirectToMini } from "@/components/mini/RedirectToMini";
import { MiniRouteGate } from "@/components/mini/MiniRouteGate";
import { identityMintPriceTagline } from "@/lib/mint-price";

export const Route = createFileRoute("/mint")({
  component: MintPage,
});

function MintPage() {
  return (
    <MiniRouteGate fallback={<RedirectToMini />}>
      <div className="space-y-4">
        <h1 className="text-2xl font-semibold tracking-tight">Mint identity</h1>
        <p className="text-sm text-muted-foreground">
          Claim your .culture name on Base. {identityMintPriceTagline}.
        </p>
        <SearchMint id="mini-mint" />
      </div>
    </MiniRouteGate>
  );
}
