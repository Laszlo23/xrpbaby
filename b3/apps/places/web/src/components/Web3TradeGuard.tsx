"use client";

import Link from "next/link";
import { useAccount, useChainId, useSwitchChain } from "wagmi";
import { TransparencyCrossLink } from "@/components/TransparencyCrossLink";
import { getListingsChainDisplayName, getListingsChainId } from "@/lib/listings-config";

type Props = {
  /** When false, only informational banners are shown (no blocking overlay). */
  children?: React.ReactNode;
  /** Primary listing has no bound on-chain sale contract — informational for Invest / Trade primary tab. */
  offlinePrimarySale?: boolean;
  /** When false, omit footer disclosure links (e.g. Trade page shows them in the page header). Default true. */
  showDisclosureFooter?: boolean;
};

export function Web3TradeGuard({ children, offlinePrimarySale, showDisclosureFooter = true }: Props) {
  const { isConnected } = useAccount();
  const walletChainId = useChainId();
  const listingsChainId = getListingsChainId();
  const expectedLabel = getListingsChainDisplayName(listingsChainId);
  const { switchChain, isPending } = useSwitchChain();

  const wrongChain = isConnected && walletChainId !== listingsChainId;

  return (
    <div className="space-y-4">
      {offlinePrimarySale ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/[0.15] px-4 py-3 text-sm text-amber-100/95">
          <strong className="text-white">Primary sale not live in this UI.</strong> Bind a sale in{" "}
          <code className="rounded bg-black/40 px-1 font-mono text-xs">primary-sales.json</code> for on-chain USDC pricing,
          or use <strong className="text-white">Secondary</strong> once an AMM pool exists.
        </div>
      ) : null}

      {!isConnected ? (
        <div className="rounded-xl border border-amber-500/25 bg-amber-950/[0.15] px-4 py-3 text-sm text-amber-50/95">
          <strong className="text-white">Wallet not connected.</strong> Connect in the header to personalize portfolio
          totals and execute purchases on-chain.
        </div>
      ) : null}

      {wrongChain ? (
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-red-500/25 bg-red-950/[0.2] px-4 py-3 text-sm text-red-50/95">
          <span>
            <strong className="text-white">Wrong network.</strong> Switch to <strong>{expectedLabel}</strong> for listings and
            trades.
          </span>
          <button
            type="button"
            disabled={isPending}
            onClick={() => switchChain?.({ chainId: listingsChainId })}
            className="shrink-0 rounded-full bg-white px-4 py-2 text-xs font-semibold text-red-950 hover:bg-zinc-100 disabled:opacity-50"
          >
            {isPending ? "Switching…" : "Switch network"}
          </button>
        </div>
      ) : null}

      {children}

      {showDisclosureFooter ? (
        <div className="border-t border-white/[0.06] pt-3">
          <TransparencyCrossLink />
          <p className="mt-2 text-[10px] text-zinc-600">
            On-chain settlement details:{" "}
            <Link href="/contracts" className="text-zinc-500 underline-offset-2 hover:text-zinc-300 hover:underline">
              Contract addresses
            </Link>
          </p>
        </div>
      ) : null}
    </div>
  );
}
