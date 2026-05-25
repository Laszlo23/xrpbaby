"use client";

import { useMemo, useState } from "react";
import { formatUnits, maxUint256 } from "viem";
import {
  useAccount,
  useChainId,
  useReadContract,
  useWaitForTransactionReceipt,
  useWriteContract,
} from "wagmi";
import { useCompliance } from "@/components/ComplianceStatus";
import { erc20Abi, primaryShareSaleErc20Abi } from "@/lib/contracts";
import { getListingsChainId } from "@/lib/listings-config";
import { nativeCurrencySymbol } from "@/lib/native-currency-label";
import { usePrimarySaleQuote } from "@/lib/use-primary-sale-quote";

const zero = "0x0000000000000000000000000000000000000000" as const;

type Row = { id: bigint; tokenAddress: `0x${string}`; symbol: string; name: string };

type Props = {
  selected: Row | undefined;
  title: string;
  explorer: string;
};

export function TradePrimarySalePanel({ selected, title, explorer }: Props) {
  const { address, isConnected } = useAccount();
  const walletChain = useChainId();
  const listingsChainId = getListingsChainId();
  const listingsNative = nativeCurrencySymbol();
  const { blocked } = useCompliance();
  const [wholeStr, setWholeStr] = useState("1");

  const quote = usePrimarySaleQuote(selected?.tokenAddress, selected?.id);
  const config = quote.config;
  const saleAddr = quote.saleAddress;
  const onChainSale = quote.onChainSale;
  const pricePerShare = quote.pricePerShare;
  const paymentToken = quote.paymentToken;
  const effectiveDecimals = quote.effectiveDecimals;
  const paySymbol = quote.paySymbol;

  const wholeShares = useMemo(() => {
    const t = wholeStr.trim();
    if (!/^\d+$/.test(t)) return 0n;
    try {
      const v = BigInt(t);
      return v >= 1n ? v : 0n;
    } catch {
      return 0n;
    }
  }, [wholeStr]);

  const totalCost =
    pricePerShare !== undefined && wholeShares > 0n ? wholeShares * pricePerShare : undefined;

  const { data: payBal } = useReadContract({
    address: paymentToken !== zero ? paymentToken : undefined,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && paymentToken !== zero && onChainSale },
  });

  const { data: allowance } = useReadContract({
    address: paymentToken !== zero ? paymentToken : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && saleAddr !== zero ? [address, saleAddr] : undefined,
    query: { enabled: !!address && paymentToken !== zero && saleAddr !== zero && onChainSale },
  });

  const needsApprove =
    totalCost !== undefined &&
    allowance !== undefined &&
    allowance < totalCost &&
    wholeShares >= 1n;

  const { writeContract: writeApprove, data: approveHash, isPending: approvePending } =
    useWriteContract();
  const { writeContract: writeBuy, data: buyHash, isPending: buyPending } = useWriteContract();

  const approveWait = useWaitForTransactionReceipt({ hash: approveHash });
  const buyWait = useWaitForTransactionReceipt({ hash: buyHash });

  function approve() {
    if (!address || saleAddr === zero || paymentToken === zero || totalCost === undefined) return;
    writeApprove({
      address: paymentToken,
      abi: erc20Abi,
      functionName: "approve",
      args: [saleAddr, maxUint256],
    });
  }

  function buy() {
    if (!address || saleAddr === zero || wholeShares < 1n || blocked) return;
    writeBuy({
      address: saleAddr,
      abi: primaryShareSaleErc20Abi,
      functionName: "buyWholeShares",
      args: [wholeShares],
    });
  }

  const busy =
    approvePending ||
    approveWait.isLoading ||
    buyPending ||
    buyWait.isLoading ||
    approveWait.isFetching ||
    buyWait.isFetching;

  const wrongChain = isConnected && walletChain !== listingsChainId;

  const canBuy =
    isConnected &&
    !!address &&
    !blocked &&
    onChainSale &&
    saleAddr !== zero &&
    wholeShares >= 1n &&
    totalCost !== undefined &&
    payBal !== undefined &&
    payBal >= totalCost &&
    allowance !== undefined &&
    allowance >= totalCost &&
    !wrongChain;

  const canApprove =
    isConnected &&
    !!address &&
    !blocked &&
    onChainSale &&
    needsApprove &&
    totalCost !== undefined &&
    !wrongChain;

  if (!selected || !config || saleAddr === zero) {
    return (
      <div className="rounded-2xl border border-white/[0.08] bg-zinc-950/60 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Primary (issuer)</p>
        <p className="mt-2 text-sm text-zinc-400">
          Whole-share checkout in USDC (or another ERC-20) appears here when a sale contract is configured in{" "}
          <code className="text-zinc-300">web/src/data/primary-sales.json</code> (or{" "}
          <code className="text-zinc-300">NEXT_PUBLIC_PRIMARY_SALES_JSON</code>). Until then, seed a{" "}
          <strong className="text-zinc-300">WETH / share</strong> pool on{" "}
          <a href="/pool" className="text-brand hover:underline">
            Pool
          </a>{" "}
          for secondary swaps in native {listingsNative} (wraps to WETH).
        </p>
      </div>
    );
  }

  if (
    config &&
    saleAddr !== zero &&
    selected &&
    quote.isShareTokenSuccess &&
    quote.shareTokenFromSale &&
    !onChainSale
  ) {
    return (
      <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4">
        <p className="text-xs font-medium uppercase tracking-wide text-amber-200/90">Primary sale config mismatch</p>
        <p className="mt-2 text-sm text-amber-100/90">
          The sale contract does not match this property&apos;s share token. Fix{" "}
          <code className="text-amber-50">primary-sales.json</code> or redeploy the sale for token{" "}
          <span className="font-mono text-[11px]">{selected.tokenAddress}</span>.
        </p>
      </div>
    );
  }

  return (
    <div className="glass-card-strong overflow-hidden shadow-xl shadow-black/30">
      <div className="border-b border-white/[0.06] px-6 py-5">
        <p className="text-xs font-medium uppercase tracking-wide text-emerald-400/90">Primary (issuer)</p>
        <p className="mt-1 text-sm text-zinc-300">{title}</p>
        <p className="mt-2 text-xs text-zinc-500">
          Buy whole shares with {paySymbol}. No AMM pool required. Issuer sets <code className="text-zinc-400">pricePerShare</code>{" "}
          on-chain.
        </p>
      </div>

      {wrongChain && (
        <p className="border-b border-white/[0.06] px-6 py-3 text-xs text-amber-300">
          Switch your wallet to chain id {listingsChainId} (listings chain) to purchase.
        </p>
      )}

      {blocked && (
        <p className="border-b border-white/[0.06] px-6 py-3 text-xs text-amber-300">
          Complete verification to buy restricted shares.
        </p>
      )}

      <div className="space-y-3 px-6 py-5">
        <label className="block text-xs font-medium uppercase tracking-wide text-zinc-500">
          Whole shares (min 1)
          <input
            type="text"
            inputMode="numeric"
            value={wholeStr}
            onChange={(e) => setWholeStr(e.target.value)}
            className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950 px-4 py-3 font-mono text-lg text-white focus:border-emerald-500/40 focus:outline-none"
          />
        </label>

        <div className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 text-sm">
          <p className="text-[10px] uppercase tracking-wide text-zinc-500">Price per whole share</p>
          <p className="mt-1 font-mono text-white">
            {pricePerShare !== undefined
              ? `${formatUnits(pricePerShare, effectiveDecimals)} ${paySymbol}`
              : "—"}
          </p>
          <p className="mt-3 text-[10px] uppercase tracking-wide text-zinc-500">Total due</p>
          <p className="mt-1 font-mono text-emerald-300/90">
            {totalCost !== undefined ? `${formatUnits(totalCost, effectiveDecimals)} ${paySymbol}` : "—"}
          </p>
          <p className="mt-2 text-[11px] text-zinc-500">
            Balance:{" "}
            {payBal !== undefined ? `${formatUnits(payBal, effectiveDecimals)} ${paySymbol}` : "—"}
          </p>
        </div>
      </div>

      <div className="flex flex-col gap-2 border-t border-white/[0.06] px-6 py-4">
        {canApprove ? (
          <button
            type="button"
            disabled={busy}
            onClick={approve}
            className="w-full rounded-xl border border-emerald-500/40 bg-emerald-950/40 py-3 text-sm font-semibold text-emerald-100 hover:bg-emerald-900/40 disabled:opacity-40"
          >
            {busy ? "Confirm in wallet…" : `Approve ${paySymbol}`}
          </button>
        ) : null}
        <button
          type="button"
          disabled={!canBuy || busy}
          onClick={buy}
          className="w-full rounded-2xl bg-gradient-to-r from-emerald-700 to-emerald-600 py-4 text-base font-semibold text-white shadow-lg shadow-emerald-950/30 disabled:opacity-40"
        >
          {busy ? "Confirm in wallet…" : `Buy ${wholeShares.toString()} whole share(s)`}
        </button>
      </div>

      {buyWait.isSuccess && buyHash && (
        <p className="border-t border-white/[0.06] px-6 py-3 text-center text-sm text-emerald-400/90">
          Purchase confirmed.{" "}
          <a href={`${explorer}/tx/${buyHash}`} target="_blank" rel="noreferrer" className="underline underline-offset-2">
            View transaction
          </a>
        </p>
      )}
    </div>
  );
}
