"use client";

import Image from "next/image";
import { useEffect, useMemo, useState } from "react";
import { formatEther, parseEther } from "viem";
import {
  useAccount,
  useReadContract,
  useWriteContract,
  useWaitForTransactionReceipt,
} from "wagmi";
import { ComplianceStatus, useCompliance } from "@/components/ComplianceStatus";
import { erc20Abi, pairAbi, routerAbi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { usePropertyShareList } from "@/lib/usePropertyShareList";

function deadline(): bigint {
  return BigInt(Math.floor(Date.now() / 1000) + 1800);
}

const zero = "0x0000000000000000000000000000000000000000" as const;

export default function PoolPage() {
  const { address, isConnected } = useAccount();
  const { blocked } = useCompliance();
  const { router, weth } = useProtocolAddresses();

  const { chainRows: rows, loading, unset } = usePropertyShareList();
  const [selectedId, setSelectedId] = useState("");
  const [amountWeth, setAmountWeth] = useState("1");
  const [amountShare, setAmountShare] = useState("1000");
  const [slippageBps, setSlippageBps] = useState(50);
  const [advancedOpen, setAdvancedOpen] = useState(false);
  const [removeLp, setRemoveLp] = useState("0");

  useEffect(() => {
    if (rows.length > 0 && selectedId === "") {
      setSelectedId(rows[0].id.toString());
    }
  }, [rows, selectedId]);

  const selected = useMemo(() => {
    if (!selectedId) return rows[0];
    const id = BigInt(selectedId);
    return rows.find((r) => r.id === id) ?? rows[0];
  }, [rows, selectedId]);

  const tokenA = weth;
  const tokenB = selected?.tokenAddress;

  const { data: pair } = useReadContract({
    address: router,
    abi: routerAbi,
    functionName: "getPair",
    args:
      tokenA !== zero && tokenB ? [tokenA as `0x${string}`, tokenB] : undefined,
    query: {
      enabled: !!tokenB && weth !== zero && router !== zero,
    },
  });

  const p = pair as `0x${string}` | undefined;

  const { data: reserves } = useReadContract({
    address: p ?? zero,
    abi: pairAbi,
    functionName: "getReserves",
    query: { enabled: !!p && p !== zero },
  });

  const { data: token0Addr } = useReadContract({
    address: p ?? zero,
    abi: pairAbi,
    functionName: "token0",
    query: { enabled: !!p && p !== zero },
  });

  const { data: pairTotalSupply } = useReadContract({
    address: p ?? zero,
    abi: pairAbi,
    functionName: "totalSupply",
    query: { enabled: !!p && p !== zero },
  });

  const { data: lpBalance } = useReadContract({
    address: p ?? zero,
    abi: erc20Abi,
    functionName: "balanceOf",
    args: address ? [address] : undefined,
    query: { enabled: !!p && p !== zero && !!address },
  });

  const amountADesired = useMemo(() => {
    try {
      return parseEther(amountWeth || "0");
    } catch {
      return 0n;
    }
  }, [amountWeth]);
  const amountBDesired = useMemo(() => {
    try {
      return parseEther(amountShare || "0");
    } catch {
      return 0n;
    }
  }, [amountShare]);

  const minA = (amountADesired * BigInt(10000 - slippageBps)) / 10000n;
  const minB = (amountBDesired * BigInt(10000 - slippageBps)) / 10000n;

  const { data: allowanceA } = useReadContract({
    address: weth !== zero ? weth : undefined,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, router as `0x${string}`] : undefined,
    query: { enabled: !!address && weth !== zero && router !== zero },
  });
  const { data: allowanceB } = useReadContract({
    address: tokenB,
    abi: erc20Abi,
    functionName: "allowance",
    args: address && tokenB ? [address, router as `0x${string}`] : undefined,
    query: { enabled: !!address && !!tokenB && router !== zero },
  });

  const { writeContract, data: txHash, isPending, error } = useWriteContract();
  const { isLoading: confirming } = useWaitForTransactionReceipt({ hash: txHash });
  const { writeContract: approveA, data: hA } = useWriteContract();
  const { writeContract: approveB, data: hB } = useWriteContract();
  const { writeContract: approveLp, data: hLp } = useWriteContract();
  const { writeContract: writeRemove, data: hR } = useWriteContract();
  const { isLoading: wA } = useWaitForTransactionReceipt({ hash: hA });
  const { isLoading: wB } = useWaitForTransactionReceipt({ hash: hB });
  const { isLoading: wLp } = useWaitForTransactionReceipt({ hash: hLp });
  const { isLoading: wR } = useWaitForTransactionReceipt({ hash: hR });

  const busy = isPending || confirming || wA || wB || wLp || wR;

  const needApproveA = allowanceA !== undefined && amountADesired > 0n && allowanceA < amountADesired;
  const needApproveB = allowanceB !== undefined && amountBDesired > 0n && allowanceB < amountBDesired;

  const canAdd =
    !!address &&
    router !== zero &&
    weth !== zero &&
    !!tokenB &&
    amountADesired > 0n &&
    amountBDesired > 0n &&
    !blocked &&
    !needApproveA &&
    !needApproveB;

  function addLiquidity() {
    if (!address || !canAdd || !tokenB) return;
    writeContract({
      address: router,
      abi: routerAbi,
      functionName: "addLiquidity",
      args: [
        tokenA as `0x${string}`,
        tokenB,
        amountADesired,
        amountBDesired,
        minA,
        minB,
        address,
        deadline(),
      ],
    });
  }

  const removeWei = useMemo(() => {
    try {
      return parseEther(removeLp || "0");
    } catch {
      return 0n;
    }
  }, [removeLp]);

  const { data: allowanceLp } = useReadContract({
    address: p ?? zero,
    abi: erc20Abi,
    functionName: "allowance",
    args: address ? [address, router as `0x${string}`] : undefined,
    query: { enabled: !!p && p !== zero && !!address },
  });

  const needLpApprove = allowanceLp !== undefined && lpBalance !== undefined && allowanceLp < removeWei;
  const canRemove =
    !!address &&
    router !== zero &&
    !!p &&
    p !== zero &&
    removeWei > 0n &&
    (lpBalance ?? 0n) >= removeWei &&
    !blocked &&
    !needLpApprove &&
    !!tokenB;

  function removeLiquidity() {
    if (!address || !p || !canRemove || !tokenB) return;
    writeRemove({
      address: router,
      abi: routerAbi,
      functionName: "removeLiquidity",
      args: [
        tokenA as `0x${string}`,
        tokenB,
        removeWei,
        0n,
        0n,
        address,
        deadline(),
      ],
    });
  }

  const shareLabel = selected?.symbol ?? "Share";

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 pb-12">
      <header className="space-y-2">
        <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-brand-muted">Liquidity</p>
        <h1 className="text-3xl font-semibold tracking-tight text-white">Liquidity pool</h1>
        <p className="text-sm leading-relaxed text-zinc-400">
          Supply both sides of the market (wrapped ETH as WETH + property shares). You earn a share of trading fees — similar to
          being a market maker, simplified in this interface.
        </p>
      </header>
      <div className="glass-card border border-brand/20 bg-brand/[0.04] p-4 text-sm text-zinc-300">
        <p className="font-medium text-white">Simple summary</p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs text-zinc-400">
          <li>Wrap native ETH to WETH, then deposit WETH + shares together.</li>
          <li>You receive LP tokens representing your share of the pool.</li>
          <li>Remove liquidity anytime to get your tokens back (plus fees earned).</li>
        </ul>
      </div>
      <ComplianceStatus />

      {router === zero || weth === zero ? (
        <p className="text-amber-400">Set NEXT_PUBLIC_ROUTER and NEXT_PUBLIC_WETH in .env.local</p>
      ) : unset ? (
        <p className="text-zinc-400">Configure registry and share factory to list properties.</p>
      ) : loading && rows.length === 0 ? (
        <p className="text-zinc-500">Loading…</p>
      ) : rows.length === 0 ? (
        <p className="text-zinc-400">No share tokens yet.</p>
      ) : (
        <>
          {p && p !== zero && reserves && (
            <div className="glass-card grid gap-4 p-5 sm:grid-cols-3">
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">TVL (reserves)</p>
                <p className="mt-1 font-mono text-sm text-white">
                  {token0Addr === weth ? formatEther(reserves[0]) : formatEther(reserves[1])}{" "}
                  <span className="text-zinc-500">WETH</span>
                </p>
                <p className="font-mono text-sm text-zinc-300">
                  {token0Addr === weth ? formatEther(reserves[1]) : formatEther(reserves[0])}{" "}
                  <span className="text-zinc-500">{shareLabel}</span>
                </p>
                <p className="mt-1 text-[10px] text-zinc-600">
                  LP supply: {pairTotalSupply !== undefined ? formatEther(pairTotalSupply) : "…"}
                </p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Fee tier</p>
                <p className="mt-1 text-sm text-gold-400">0.30% (Uniswap V2–style)</p>
              </div>
              <div>
                <p className="text-xs uppercase tracking-wide text-zinc-500">Reference APR</p>
                <p className="mt-1 text-sm text-zinc-400">
                  Volume-weighted fees ÷ TVL — wire indexer for live APR.
                </p>
              </div>
            </div>
          )}

          <div className="max-h-56 space-y-2 overflow-y-auto">
            {rows.map((r) => {
              const active = selected?.id === r.id;
              return (
                <button
                  key={r.id.toString()}
                  type="button"
                  onClick={() => setSelectedId(r.id.toString())}
                  className={`flex w-full items-center gap-3 rounded-2xl border p-3 text-left transition ${
                    active
                      ? "border-gold-500/40 bg-gold-500/10 ring-1 ring-gold-500/25"
                      : "border-white/[0.06] bg-white/[0.02] hover:border-white/15"
                  }`}
                >
                  {r.demo?.imageSrc ? (
                    <div className="relative h-12 w-16 shrink-0 overflow-hidden rounded-lg bg-zinc-800">
                      <Image
                        src={r.demo.imageSrc}
                        alt={r.demo.imageAlt}
                        fill
                        className="object-cover"
                        sizes="64px"
                      />
                    </div>
                  ) : (
                    <div className="h-12 w-16 shrink-0 rounded-lg bg-zinc-800" />
                  )}
                  <div className="min-w-0">
                    <p className="text-sm font-medium text-zinc-100">{r.demo?.headline ?? r.name}</p>
                    <p className="text-xs text-zinc-500">{r.symbol}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <div className="glass-card space-y-3 p-5">
            <h2 className="text-sm font-medium text-zinc-200">Add liquidity</h2>
            <label className="block text-xs text-zinc-500">
              WETH amount (wrap ETH first)
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm"
                value={amountWeth}
                onChange={(e) => setAmountWeth(e.target.value)}
              />
            </label>
            <label className="block text-xs text-zinc-500">
              Share amount ({selected?.symbol ?? "…"})
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm"
                value={amountShare}
                onChange={(e) => setAmountShare(e.target.value)}
              />
            </label>
            <label className="block text-xs text-zinc-500">
              Slippage (bps)
              <input
                type="number"
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm"
                value={slippageBps}
                onChange={(e) => setSlippageBps(Number(e.target.value) || 0)}
              />
            </label>

            {reserves && p && p !== zero && token0Addr && (
              <p className="text-xs text-zinc-500">
                Raw reserves — token0: {formatEther(reserves[0])} · token1: {formatEther(reserves[1])}
              </p>
            )}

            {blocked && (
              <p className="text-xs text-amber-400">Verified wallet required for restricted share tokens.</p>
            )}

            {needApproveA && (
              <button
                type="button"
                disabled={!isConnected || busy}
                onClick={() =>
                  approveA({
                    address: weth as `0x${string}`,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [router as `0x${string}`, 2n ** 256n - 1n],
                  })
                }
                className="w-full rounded-xl border border-zinc-600 py-2.5 text-sm"
              >
                Approve WETH
              </button>
            )}
            {needApproveB && tokenB && (
              <button
                type="button"
                disabled={!isConnected || busy}
                onClick={() =>
                  approveB({
                    address: tokenB,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [router as `0x${string}`, 2n ** 256n - 1n],
                  })
                }
                className="w-full rounded-xl border border-zinc-600 py-2.5 text-sm"
              >
                Approve {selected?.symbol ?? "share"}
              </button>
            )}

            <button
              type="button"
              disabled={!isConnected || !canAdd || busy}
              onClick={addLiquidity}
              className="w-full rounded-2xl bg-gradient-to-r from-gold-600 to-gold-500 py-3 text-sm font-semibold text-black hover:from-gold-500 hover:to-gold-400 disabled:opacity-40"
            >
              {busy ? "Confirm…" : "Add liquidity"}
            </button>
            {error && <p className="text-xs text-red-400">{error.message}</p>}
          </div>

          <div className="glass-card space-y-3 p-5">
            <h2 className="text-sm font-medium text-zinc-200">Remove liquidity</h2>
            <p className="text-xs text-zinc-500">
              LP balance: {lpBalance !== undefined ? formatEther(lpBalance) : "…"}
            </p>
            <label className="block text-xs text-zinc-500">
              LP amount to remove
              <input
                className="mt-1 w-full rounded-xl border border-zinc-700 bg-zinc-950 px-3 py-2 font-mono text-sm"
                value={removeLp}
                onChange={(e) => setRemoveLp(e.target.value)}
              />
            </label>
            {needLpApprove && (
              <button
                type="button"
                disabled={!isConnected || busy || !p}
                onClick={() =>
                  approveLp({
                    address: p!,
                    abi: erc20Abi,
                    functionName: "approve",
                    args: [router as `0x${string}`, 2n ** 256n - 1n],
                  })
                }
                className="w-full rounded-xl border border-zinc-600 py-2.5 text-sm"
              >
                Approve LP token
              </button>
            )}
            <button
              type="button"
              disabled={!isConnected || !canRemove || busy}
              onClick={removeLiquidity}
              className="w-full rounded-2xl bg-zinc-700 py-3 text-sm font-semibold text-white hover:bg-zinc-600 disabled:opacity-40"
            >
              {busy ? "Confirm…" : "Remove liquidity"}
            </button>
          </div>

          <button
            type="button"
            onClick={() => setAdvancedOpen(!advancedOpen)}
            className="w-full text-center text-xs text-zinc-500 hover:text-zinc-400"
          >
            {advancedOpen ? "Hide" : "Show"} contract addresses
          </button>
          {advancedOpen && tokenB && (
            <div className="rounded-xl border border-zinc-800 bg-zinc-950/80 p-4 font-mono text-[10px] text-zinc-500">
              <p>WETH: {weth}</p>
              <p>Share: {tokenB}</p>
              <p>Pair: {p === zero ? "— (create by adding)" : p}</p>
            </div>
          )}
        </>
      )}
    </div>
  );
}
