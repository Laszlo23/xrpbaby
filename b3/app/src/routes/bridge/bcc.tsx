import { createFileRoute, Link } from "@tanstack/react-router";
import { MarketingShell } from "@/components/MarketingShell";
import { BccBridgePanel } from "@/components/bcc/BccBridgePanel";
import { BCC_SYMBOL } from "@bc/bcc-kit";
import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/bridge/bcc")({
  head: () =>
    pageHead({
      title: `Bridge ${BCC_SYMBOL} — ${BRAND_DISPLAY_NAME}`,
      description: `Move ${BCC_SYMBOL} 1:1 between Base and BNB Chain — same supply, LayerZero OFT.`,
      path: "/bridge/bcc",
      keywords: ["BCC", "bridge", "LayerZero", "OFT", "Base", "BNB"],
    }),
  component: BridgeBccPage,
});

function BridgeBccPage() {
  return (
    <MarketingShell
      eyebrow="Cross-chain"
      title={`Bridge ${BCC_SYMBOL}`}
      subtitle={`Same token on Base and BNB Chain — lock on one chain, mint 1:1 on the other. No new coin.`}
      tone="cyan"
      articleClassName="max-w-lg"
    >
      <div className="rounded-2xl border border-[#C5FF41]/25 bg-black/40 p-5">
        <BccBridgePanel />
      </div>
      <p className="mt-6 text-center text-xs text-zinc-500">
        <Link to="/swap" className="text-[#C5FF41] hover:underline">
          Swap for {BCC_SYMBOL}
        </Link>
      </p>
    </MarketingShell>
  );
}
