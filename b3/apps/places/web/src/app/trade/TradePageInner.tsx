"use client";

import Image from "next/image";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useBalance,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ComplianceStatus, useCompliance } from "@/components/ComplianceStatus";
import { TrustSection } from "@/components/TrustSection";
import { TransparencyCrossLink } from "@/components/TransparencyCrossLink";
import { Web3TradeGuard } from "@/components/Web3TradeGuard";
import { TradePrimarySalePanel } from "@/components/trade/TradePrimarySalePanel";
import { erc20Abi, pairAbi, proofNftAbi, routerAbi } from "@/lib/contracts";
import { nativeCurrencySymbol } from "@/lib/native-currency-label";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { formatIllustrativeEconomics } from "@/lib/demo-properties";
import { usePrimarySaleQuote } from "@/lib/use-primary-sale-quote";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

function deadline(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 1800);
}

const zero = "0x0000000000000000000000000000000000000000" as const;

export function TradePageInner() {
  const nextRouter = useRouter();
  const searchParams = useSearchParams();
  const propertyFromUrl = searchParams.get("property");
  const marketFromUrl = searchParams.get("market");

  const { address, isConnected } = useAccount();
  const nativeSym = nativeCurrencySymbol();
  const { blocked } = useCompliance();
  const { router, weth, proofNft, explorer: explorerBase } = useProtocolAddresses();

  const { chainRows: rows, loading, unset } = usePropertyShareList();
  const [selectedId, setSelectedId] = useState<string>("");
  const [search, setSearch] = useState("");
  const [amountNative, setAmountNative] = useState("0.1");
  const [slippageBps, setSlippageBps] = useState(50);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [marketTab, setMarketTab] = useState<"primary" | "secondary">("primary");

  useEffect(() => {
    if (marketFromUrl === "secondary") {
      setMarketTab("secondary");
      return;
    }
    if (marketFromUrl === "primary") {
      setMarketTab("primary");
    }
  }, [marketFromUrl]);

  useEffect(() => {
    if (marketFromUrl === "primary" || marketFromUrl === "secondary") return;
    if (typeof window === "undefined") return;
    const h = window.location.hash;
    if (h === "#secondary") setMarketTab("secondary");
    else if (h === "#primary") setMarketTab("primary");
  }, [marketFromUrl]);

  useEffect(() => {
    if (rows.length === 0) return;
    if (propertyFromUrl && rows.some((r) => r.id.toString() === propertyFromUrl)) {
      setSelectedId(propertyFromUrl);
      return;
    }
    if (selectedId === "") {
      setSelectedId(rows[0].id.toString());
    }
  }, [rows, selectedId, propertyFromUrl]);

  const selected = useMemo(() => {
    if (!selectedId) return rows[0];
    const id = BigInt(selectedId);
    return rows.find((r) => r.id === id) ?? rows[0];
  }, [rows, selectedId]);

  const primaryQuote = usePrimarySaleQuote(
    selected?.tokenAddress as `0x${string}` | undefined,
    selected?.id,
  );

  const tokenOut = selected?.tokenAddress;

  const filteredRows = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return rows;
    return rows.filter((r) => {
      const h = r.demo?.headline ?? r.name;
      const loc = r.demo?.location ?? "";
      return h.toLowerCase().includes(q) || loc.toLowerCase().includes(q) || r.symbol.toLowerCase().includes(q);
    });
  }, [rows, search]);

  const amountInWei = useMemo(() => {
    try {
      return parseEther(amountNative || "0");
    } catch {
      return 0n;
    }
  }, [amountNative]);

  const { data: ethPair } = useReadContract({
    address: router,
    abi: routerAbi,
    functionName: "getPair",
    args:
      weth !== zero && tokenOut ? [weth as `0x${string}`, tokenOut] : undefined,
    query: {
      enabled: !!tokenOut && weth !== zero && router !== zero,
    },
  });

  const { data: ethRes } = useReadContract({
    address: (ethPair ?? zero) as `0x${string}`,
    abi: pairAbi,
    functionName: "getReserves",
    query: {
      enabled: !!ethPair && ethPair !== zero,
    },
  });

  const { data: ethToken0 } = useReadContract({
    address: (ethPair ?? zero) as `0x${string}`,
    abi: pairAbi,
    functionName: "token0",
    query: {
      enabled: !!ethPair && ethPair !== zero,
    },
  });

  const { data: quoteEthOut } = useReadContract({
    address: router,
    abi: routerAbi,
    functionName: "getAmountOut",
    args:
      ethRes && ethToken0 && ethPair && amountInWei > 0n && weth
        ? (() => {
            const [r0, r1] = [ethRes[0], ethRes[1]];
            const t0 = ethToken0 as `0x${string}`;
            const reserveIn = weth === t0 ? BigInt(r0) : BigInt(r1);
            const reserveOut = weth === t0 ? BigInt(r1) : BigInt(r0);
            return [amountInWei, reserveIn, reserveOut] as const;
          })()
        : undefined,
    query: {
      enabled:
        !!ethPair &&
        ethPair !== zero &&
        amountInWei > 0n &&
        !!ethRes &&
        !!ethToken0,
    },
  });

  const minOutEth =
    quoteEthOut !== undefined ? (quoteEthOut * BigInt(10000 - slippageBps)) / 10000n : 0n;

  const { data: shareBalance } = useReadContract({
    address: tokenOut,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!address && !!tokenOut },
  });

  const { data: nativeBal } = useBalance({ address });

  const { data: alreadyClaimed, isFetched: claimStatusLoaded } = useReadContract({
    address: proofNft,
    abi: proofNftAbi,
    functionName: "claimed",
    args:
      address && selected
        ? [address, selected.id]
        : undefined,
    query: {
      enabled:
        !!address && !!selected && proofNft !== zero,
    },
  });

  const { writeContract: writeSwap, data: swapHash, isPending: swapPending, error: swapError } =
    useWriteContract();
  const { isLoading: swapConfirming, isSuccess: swapSuccess } = useWaitForTransactionReceipt({
    hash: swapHash,
  });

  const { writeContract: writeClaim, data: claimHash, isPending: claimPending } = useWriteContract();
  const { isLoading: claimConfirming } = useWaitForTransactionReceipt({ hash: claimHash });

  const canSwap =
    isConnected &&
    !!address &&
    !blocked &&
    router !== zero &&
    !!tokenOut &&
    ethPair !== zero &&
    amountInWei > 0n;

  function buy() {
    if (!canSwap || !address || !tokenOut) return;
    writeSwap({
      address: router,
      abi: routerAbi,
      functionName: "swapExactETHForTokens",
      args: [minOutEth, tokenOut, address, deadline()],
      value: amountInWei,
    });
  }

  function claimProof() {
    if (!address || !selected || proofNft === zero) return;
    writeClaim({
      address: proofNft,
      abi: proofNftAbi,
      functionName: "claim",
      args: [selected.id],
    });
  }

  const busy = swapPending || swapConfirming || claimPending || claimConfirming;
  const economicsLine = selected?.demo ? formatIllustrativeEconomics(selected.demo) : null;
  const displayTitle = selected?.demo?.headline ?? selected?.name ?? "Choose a property";

  function syncMarketTab(tab: "primary" | "secondary") {
    setMarketTab(tab);
    const id = selected?.id.toString() ?? "";
    const p = new URLSearchParams();
    if (id) p.set("property", id);
    p.set("market", tab);
    nextRouter.replace(`/trade?${p.toString()}`, { scroll: false });
  }

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 pb-16">
      <header className="space-y-2 text-center sm:text-left">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Marketplace</p>
        <h1 className="text-3xl font-bold tracking-tight text-white">Trade</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          <strong className="text-white">Primary:</strong> whole shares in USDC (or another ERC-20) when configured — no pool
          needed. <strong className="text-white">Secondary:</strong> swap native {nativeSym} via WETH/share pools; pool price
          follows reserves.
        </p>
      </header>

      <ComplianceStatus />
      <TrustSection />

      <div className="flex justify-center px-2">
        <TransparencyCrossLink className="text-center" />
      </div>

      <p className="text-center text-[11px] leading-relaxed text-zinc-500">
        <strong className="text-zinc-400">Primary</strong> (issuer) sales can require whole shares only (min. one full
        share) — see{" "}
        <a href="/how-it-works" className="text-brand hover:underline">
          How it works
        </a>
        . Reference seeding assumes ~$<span className="text-zinc-400">1,000</span> notional per 1.0 whole share.
      </p>

      {unset ? (
        <p className="text-center text-sm text-amber-400">
          Configure registry and factory in <code className="text-gold-400">.env.local</code> to load listings.
        </p>
      ) : loading && rows.length === 0 ? (
        <div className="grid gap-8 lg:grid-cols-5">
          <div className="space-y-4 lg:col-span-3">
            <div className="h-10 w-full animate-pulse rounded-xl bg-zinc-800/80" />
            <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
              <div className="min-w-[720px] space-y-0 p-4">
                <div className="mb-4 h-4 w-48 animate-pulse rounded bg-zinc-800" />
                {Array.from({ length: 5 }).map((_, i) => (
                  <div key={i} className="flex gap-4 border-b border-white/[0.04] py-3">
                    <div className="h-10 w-40 animate-pulse rounded-md bg-zinc-800/80" />
                    <div className="h-4 flex-1 animate-pulse rounded bg-zinc-800/60" />
                    <div className="h-8 w-16 animate-pulse rounded-full bg-zinc-800/80" />
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="space-y-4 lg:col-span-2">
            <div className="h-48 animate-pulse rounded-2xl border border-white/[0.06] bg-zinc-900/80" />
            <div className="h-24 animate-pulse rounded-xl bg-zinc-900/60" />
          </div>
        </div>
      ) : rows.length === 0 ? (
        <p className="text-center text-zinc-400">No share tokens yet. Seed properties first.</p>
      ) : (
        <>
          <div className="flex flex-wrap gap-2 border-b border-white/[0.06] pb-4">
            <button
              type="button"
              onClick={() => syncMarketTab("primary")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                marketTab === "primary"
                  ? "bg-emerald-600 text-white shadow-lg shadow-emerald-900/30"
                  : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              Primary market
            </button>
            <button
              type="button"
              onClick={() => syncMarketTab("secondary")}
              className={`rounded-full px-5 py-2 text-sm font-semibold transition ${
                marketTab === "secondary"
                  ? "bg-gold-600 text-black shadow-lg shadow-gold-900/30"
                  : "border border-white/10 bg-white/[0.04] text-zinc-400 hover:border-white/20 hover:text-white"
              }`}
            >
              Secondary market
            </button>
          </div>

          <div className="grid gap-8 lg:grid-cols-5 lg:items-start">
            <div className="flex min-h-0 min-w-0 flex-col space-y-6 lg:col-span-3">
              <label className="block text-left text-xs font-medium uppercase tracking-wide text-muted">
                Search
                <input
                  type="search"
                  placeholder="City, name, or symbol…"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="mt-1.5 w-full rounded-xl border border-white/10 bg-zinc-950/80 px-4 py-3 text-sm text-white placeholder:text-zinc-600 focus:border-brand/50 focus:outline-none"
                />
              </label>

              <div className="max-h-72 space-y-2 overflow-y-auto pr-1 md:hidden">
                {filteredRows.map((r) => {
                  const active = selected?.id === r.id;
                  return (
                    <button
                      key={r.id.toString()}
                      type="button"
                      onClick={() => setSelectedId(r.id.toString())}
                      className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                        active
                          ? "border-brand/50 bg-brand/10 ring-1 ring-brand/30"
                          : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                      }`}
                    >
                      {r.demo?.imageSrc ? (
                        <div className="relative h-14 w-20 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                          <Image
                            src={r.demo.imageSrc}
                            alt={r.demo.imageAlt}
                            fill
                            className="object-cover"
                            sizes="80px"
                          />
                        </div>
                      ) : (
                        <div className="h-14 w-20 shrink-0 rounded-lg bg-zinc-800" />
                      )}
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-white">{r.demo?.headline ?? r.name}</p>
                        <p className="text-xs text-muted">{r.demo?.location ?? r.symbol}</p>
                      </div>
                      <span className="shrink-0 text-xs text-muted">#{r.id.toString()}</span>
                    </button>
                  );
                })}
              </div>

              <div className="hidden min-h-0 flex-1 flex-col space-y-3 md:flex">
                <p className="text-xs text-muted">
                  <strong className="text-zinc-400">Choose a property</strong> — the highlighted row is what the Primary /
                  Secondary panel on the right applies to. Click a row or <span className="text-zinc-400">Select</span>.
                </p>
                <div className="max-h-[min(52vh,28rem)] overflow-x-auto overflow-y-auto rounded-2xl border border-white/[0.08] lg:max-h-[min(70vh,36rem)]">
                  <table className="w-full min-w-[640px] text-left text-sm">
                    <thead className="sticky top-0 z-[1] border-b border-white/[0.08] bg-zinc-950/95 text-muted backdrop-blur-sm">
                      <tr>
                        <th className="px-4 py-3 font-medium">Property token</th>
                        <th className="px-4 py-3 font-medium">Venue note</th>
                        <th className="px-4 py-3 font-medium">24h</th>
                        <th className="px-4 py-3 font-medium">Volume</th>
                        <th className="px-4 py-3 font-medium">Liquidity</th>
                        <th className="px-4 py-3 text-right font-medium">Select</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredRows.map((r) => {
                        const active = selected?.id === r.id;
                        return (
                          <tr
                            key={r.id.toString()}
                            className={`cursor-pointer border-b border-white/[0.04] transition hover:bg-white/[0.03] ${
                              active ? "bg-brand/10 ring-1 ring-inset ring-brand/25" : ""
                            }`}
                            onClick={() => setSelectedId(r.id.toString())}
                          >
                            <td className="px-4 py-3">
                              <div className="flex items-center gap-2">
                                {r.demo?.imageSrc ? (
                                  <div className="relative h-10 w-14 shrink-0 overflow-hidden rounded-md bg-zinc-800">
                                    <Image
                                      src={r.demo.imageSrc}
                                      alt={r.demo.imageAlt ?? r.name}
                                      fill
                                      className="object-cover"
                                      sizes="56px"
                                    />
                                  </div>
                                ) : (
                                  <div className="h-10 w-14 shrink-0 rounded-md bg-zinc-800" />
                                )}
                                <div>
                                  <p className="font-medium text-white">{r.demo?.headline ?? r.name}</p>
                                  <p className="text-xs text-muted">{r.symbol}</p>
                                </div>
                              </div>
                            </td>
                            <td className="px-4 py-3 font-mono text-muted">AMM</td>
                            <td className="px-4 py-3 text-muted">—</td>
                            <td className="px-4 py-3 text-muted">—</td>
                            <td className="px-4 py-3 text-muted">Pool</td>
                            <td className="px-4 py-3 text-right">
                              <button
                                type="button"
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setSelectedId(r.id.toString());
                                }}
                                className="rounded-full bg-brand px-4 py-1.5 text-xs font-semibold text-[#0A0A0A] hover:bg-brand-light"
                              >
                                Select
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                <p className="text-[10px] text-muted">
                  24h, volume, and liquidity are not indexed here — connect a subgraph for live market stats.
                </p>
              </div>
            </div>

            <div className="space-y-10 lg:col-span-2 lg:sticky lg:top-28 lg:self-start">
              <Web3TradeGuard
                showDisclosureFooter={false}
                offlinePrimarySale={marketTab === "primary" && !!selected && !primaryQuote.onChainSale}
              >
              {marketTab === "primary" ? (
              <section id="primary" className="scroll-mt-28 space-y-3">
                <div>
                  <h2 className="text-lg font-semibold text-white">Primary market</h2>
                  <p className="mt-1 text-sm text-muted">
                    Buy whole shares from the issuer when a sale contract is configured — pay with ERC-20 (typically USDC).
                  </p>
                </div>
                <TradePrimarySalePanel
                  selected={
                    selected
                      ? {
                          id: selected.id,
                          tokenAddress: selected.tokenAddress as `0x${string}`,
                          symbol: selected.symbol,
                          name: selected.name,
                        }
                      : undefined
                  }
                  title={displayTitle}
                  explorer={explorerBase}
                />
              </section>
              ) : null}

              {marketTab === "secondary" ? (
              <section id="secondary" className="scroll-mt-28 space-y-6">
                <div>
                  <h2 className="text-lg font-semibold text-white">Secondary market</h2>
                  <p className="mt-1 text-sm text-muted">
                    Swap native {nativeSym} (via WETH) into shares when a pool exists — sell path can be added later.
                  </p>
                </div>

          <div className="glass-card-strong overflow-hidden shadow-2xl shadow-black/40">
            <div className="border-b border-white/[0.06] px-6 py-3">
              <p className="text-[10px] font-medium uppercase tracking-wide text-zinc-500">Secondary (AMM)</p>
            </div>
            <div className="space-y-1 border-b border-white/[0.06] px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gold-500/90">You pay</p>
              <div className="flex items-baseline justify-between gap-2">
                <input
                  type="text"
                  inputMode="decimal"
                  value={amountNative}
                  onChange={(e) => setAmountNative(e.target.value)}
                  className="min-w-0 flex-1 bg-transparent text-3xl font-semibold tracking-tight text-white placeholder:text-zinc-600 focus:outline-none"
                  placeholder="0.0"
                />
                <span className="shrink-0 rounded-full border border-white/10 bg-white/[0.06] px-3 py-1 text-sm font-medium text-zinc-200">
                  {nativeSym}
                </span>
              </div>
              {nativeBal && (
                <p className="text-xs text-zinc-500">
                  Balance: {formatEther(nativeBal.value)} {nativeSym} (wraps to WETH for the pool)
                </p>
              )}
            </div>

            <div className="space-y-1 px-6 py-5">
              <p className="text-xs font-medium uppercase tracking-wide text-gold-500/90">You receive (est.)</p>
              <p className="text-gold-400/90">{displayTitle}</p>
              <p className="text-2xl font-semibold text-white">
                {quoteEthOut !== undefined ? formatEther(quoteEthOut) : "—"}{" "}
                <span className="text-lg font-normal text-zinc-400">
                  {selected?.symbol ?? "shares"}
                </span>
              </p>
              {quoteEthOut !== undefined && (
                <p className="text-xs text-zinc-500">
                  Min after slippage: {formatEther(minOutEth)} {selected?.symbol}
                </p>
              )}
            </div>

            {economicsLine && (
              <p className="border-t border-white/[0.06] px-6 py-3 text-xs text-zinc-400">{economicsLine}</p>
            )}

            <div className="border-t border-white/[0.06] px-6 py-4">
              <label className="text-xs text-zinc-500">
                Slippage tolerance (bps)
                <input
                  type="number"
                  value={slippageBps}
                  onChange={(e) => setSlippageBps(Number(e.target.value) || 0)}
                  className="mt-1 w-full rounded-lg border border-white/10 bg-zinc-950 px-3 py-2 font-mono text-sm"
                />
              </label>
            </div>

            {blocked && (
              <p className="border-t border-white/[0.06] px-6 py-3 text-xs text-amber-300">
                Complete verification to buy restricted shares.
              </p>
            )}

            {ethPair === zero && tokenOut && (
              <p className="border-t border-white/[0.06] px-6 py-3 text-xs text-amber-400">
                No liquidity pool for this property yet. Add {nativeSym} + shares on the{" "}
                <a href="/pool" className="text-brand underline underline-offset-2">
                  Pool
                </a>{" "}
                page first (someone must seed both sides of the pair).
              </p>
            )}

            <div className="p-4">
              <button
                type="button"
                disabled={!canSwap || busy || ethPair === zero}
                onClick={buy}
                className="w-full rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 py-4 text-base font-semibold text-black shadow-lg shadow-gold-900/20 transition hover:from-gold-500 hover:to-gold-400 disabled:opacity-40"
              >
                {busy ? "Confirm in wallet…" : "Buy shares"}
              </button>
            </div>
          </div>

          {(shareBalance !== undefined && shareBalance > 0n) || swapSuccess ? (
            <div className="glass-card px-5 py-4">
              <p className="text-xs font-medium uppercase tracking-wide text-zinc-500">Your position</p>
              <p className="mt-1 text-sm text-zinc-300">
                {selected?.symbol}: {shareBalance !== undefined ? formatEther(shareBalance) : "…"} shares
              </p>
              {proofNft !== zero &&
                selected &&
                claimStatusLoaded &&
                !alreadyClaimed &&
                shareBalance !== undefined &&
                shareBalance > 0n && (
                <button
                  type="button"
                  disabled={busy || blocked}
                  onClick={claimProof}
                  className="mt-3 w-full rounded-xl border border-gold-800/50 bg-gold-950/30 py-3 text-sm font-medium text-gold-100 hover:bg-gold-900/40 disabled:opacity-40"
                >
                  Mint soulbound proof NFT (certificate)
                </button>
              )}
              {proofNft !== zero && claimStatusLoaded && alreadyClaimed && (
                <p className="mt-2 text-xs text-zinc-500">You already claimed a certificate for this property.</p>
              )}
            </div>
          ) : null}

          {swapSuccess && swapHash && (
            <p className="text-center text-sm text-gold-400/90">
              Swap confirmed.{" "}
              <a
                href={`${explorerBase}/tx/${swapHash}`}
                target="_blank"
                rel="noreferrer"
                className="underline underline-offset-2"
              >
                View transaction
              </a>
            </p>
          )}
          {swapError && <p className="text-center text-xs text-red-400">{swapError.message}</p>}
              </section>
              ) : null}
              </Web3TradeGuard>
            </div>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full text-center text-xs text-muted underline-offset-2 hover:text-white"
          >
            {advancedOpen ? "Hide" : "Show"} technical details
          </button>
          {advancedOpen && selected && (
            <div className="rounded-xl border border-white/[0.06] bg-zinc-950/80 p-4 font-mono text-[10px] leading-relaxed text-muted">
              <p>Share token: {tokenOut}</p>
              <p>WETH: {weth}</p>
              <p>Router: {router}</p>
              <p>Pair: {ethPair === zero ? "—" : ethPair}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
