import { useEffect, useState } from "react";
import { useLocation } from "@tanstack/react-router";
import {
  BCC_ADDRESS,
  BCC_DISCOUNT_LABEL,
  BCC_SYMBOL,
  buildJumperBnbToBccUrl,
  buildJumperSolToBccUrl,
  type BccBnbBuyRoute,
  type BccSolanaBuyRoute,
} from "@bc/bcc-kit";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { BccSwapPanel } from "@/components/swap/BccSwapPanel";
import { BccBnbBridgePanel } from "@/components/bcc/BccBnbBridgePanel";

function shortAddress(addr: string) {
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}

type SolanaRouteResponse = {
  ok?: boolean;
  estimate?: {
    solAmount: number;
    approxBccAfterFees?: number;
    notionalUsd?: number;
  };
  routes?: BccSolanaBuyRoute[];
  recommended?: { label: string; href: string };
};

type BnbRouteResponse = {
  ok?: boolean;
  estimate?: {
    bnbAmount: number;
    approxBccAfterFees?: number;
    notionalUsd?: number;
  };
  routes?: BccBnbBuyRoute[];
  recommended?: { label: string; href: string };
};

/**
 * Floating "Buy BCC" button + modal. In-app Base swap + BNB/Solana bridge paths.
 */
export function BuyBccButton() {
  const { pathname } = useLocation();
  const [open, setOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const [solanaData, setSolanaData] = useState<SolanaRouteResponse | null>(null);
  const [bnbData, setBnbData] = useState<BnbRouteResponse | null>(null);
  const [solanaLoading, setSolanaLoading] = useState(false);
  const [bnbLoading, setBnbLoading] = useState(false);

  useEffect(() => {
    if (!open) return;
    setSolanaLoading(true);
    setBnbLoading(true);
    fetch("/api/market/bcc/solana-route?sol=1")
      .then((r) => r.json())
      .then((d: SolanaRouteResponse) => setSolanaData(d))
      .catch(() => setSolanaData(null))
      .finally(() => setSolanaLoading(false));
    fetch("/api/market/bcc/bnb-route?bnb=0.1")
      .then((r) => r.json())
      .then((d: BnbRouteResponse) => setBnbData(d))
      .catch(() => setBnbData(null))
      .finally(() => setBnbLoading(false));
  }, [open]);

  const jumperSolHref = solanaData?.recommended?.href ?? buildJumperSolToBccUrl("SOL");
  const jumperBnbHref = bnbData?.recommended?.href ?? buildJumperBnbToBccUrl("BNB");

  if (pathname === "/pass" || pathname.startsWith("/pass/") || pathname.startsWith("/id")) {
    return null;
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        data-testid="buy-bcc-fab"
        className="fixed bottom-floating-high left-4 z-30 min-h-11 rounded-full bg-gradient-to-r from-[#C5FF41] to-[#00E5FF] px-5 py-3 text-sm font-bold text-black shadow-lg transition hover:opacity-90 sm:left-auto sm:right-4 sm:bottom-floating-safe"
        aria-label={`Buy ${BCC_SYMBOL}`}
      >
        Buy {BCC_SYMBOL}
      </button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="glass max-h-[85vh] overflow-y-auto border-[#C5FF41]/35 sm:max-w-md sm:rounded-3xl">
          <DialogHeader>
            <DialogTitle className="font-heading text-xl">Get {BCC_SYMBOL}</DialogTitle>
            <DialogDescription className="text-zinc-500">
              One fair-launch token on Base. Pay with {BCC_SYMBOL} for{" "}
              <span className="font-semibold text-[#C5FF41]">{BCC_DISCOUNT_LABEL}</span> on
              identity, art, and Places.
            </DialogDescription>
          </DialogHeader>

          <Tabs defaultValue="base" className="mt-2">
            <TabsList className="grid w-full grid-cols-3 bg-black/40">
              <TabsTrigger value="base">On Base</TabsTrigger>
              <TabsTrigger value="bnb">From BNB</TabsTrigger>
              <TabsTrigger value="solana">Solana</TabsTrigger>
            </TabsList>

            <TabsContent value="base" className="mt-3 space-y-3">
              <BccSwapPanel compact />
            </TabsContent>

            <TabsContent value="bnb" className="mt-3 space-y-3">
              <BccBnbBridgePanel compact />
              {bnbLoading ? null : bnbData?.estimate?.approxBccAfterFees ? (
                <p className="rounded-lg border border-[#F0B90B]/25 bg-[#F0B90B]/5 px-3 py-2 text-xs text-zinc-300">
                  Quick estimate: ~{bnbData.estimate.approxBccAfterFees} {BCC_SYMBOL} for{" "}
                  {bnbData.estimate.bnbAmount} BNB
                </p>
              ) : null}
              <a
                href={jumperBnbHref}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-full border border-[#F0B90B]/40 px-5 py-2 text-center text-xs font-semibold text-[#F0B90B] hover:bg-[#F0B90B]/10"
              >
                Open {bnbData?.recommended?.label ?? "Jumper"} →
              </a>
            </TabsContent>

            <TabsContent value="solana" className="mt-3 space-y-3">
              <p className="text-xs leading-relaxed text-zinc-400">
                Connect Phantom (or another Solana wallet). Aggregators bridge to Base and deliver{" "}
                {BCC_SYMBOL} to your Base address — add Base in the same wallet app if prompted.
              </p>

              {solanaLoading ? (
                <p className="text-xs text-zinc-500">Loading routes…</p>
              ) : solanaData?.estimate?.approxBccAfterFees ? (
                <p className="rounded-lg border border-[#00E5FF]/25 bg-[#00E5FF]/5 px-3 py-2 text-xs text-zinc-300">
                  ~{solanaData.estimate.approxBccAfterFees} {BCC_SYMBOL} for{" "}
                  {solanaData.estimate.solAmount} SOL (estimate, fees extra)
                </p>
              ) : null}

              <a
                href={jumperSolHref}
                target="_blank"
                rel="noreferrer noopener"
                className="block rounded-full bg-gradient-to-r from-[#9945FF] to-[#00E5FF] px-5 py-3 text-center text-sm font-bold text-white transition hover:opacity-90"
              >
                {solanaData?.recommended?.label ?? "Jumper"}: SOL → {BCC_SYMBOL} on Base →
              </a>

              <ul className="max-h-40 space-y-2 overflow-y-auto text-xs">
                {(solanaData?.routes ?? []).slice(1).map((route) => (
                  <li key={route.id}>
                    <a
                      href={route.primaryHref}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="font-medium text-[#C5FF41] hover:underline"
                    >
                      {route.label}
                    </a>
                    <span className="text-zinc-500"> — {route.description}</span>
                  </li>
                ))}
              </ul>
            </TabsContent>
          </Tabs>

          <div className="mt-3 flex items-center justify-between text-xs text-zinc-500">
            <span>Base · {BCC_SYMBOL}</span>
            <button
              type="button"
              onClick={() => {
                void navigator.clipboard?.writeText(BCC_ADDRESS).then(() => {
                  setCopied(true);
                  setTimeout(() => setCopied(false), 1500);
                });
              }}
              className="rounded-full border border-white/15 bg-black/30 px-2.5 py-1 font-mono text-[11px] text-zinc-300 hover:text-white"
            >
              {copied ? "Copied!" : shortAddress(BCC_ADDRESS)}
            </button>
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
