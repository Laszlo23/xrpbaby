"use client";

import Image from "next/image";
import Link from "next/link";
import { useCallback, useEffect, useMemo, useState } from "react";
import { formatEther, zeroAddress } from "viem";
import { useAccount, useBalance, useReadContracts } from "wagmi";
import { ComplianceStatus } from "@/components/ComplianceStatus";
import { PortfolioIllustrativeCharts } from "@/components/PortfolioIllustrativeCharts";
import { TrustSection } from "@/components/TrustSection";
import { erc20Abi } from "@/lib/contracts";
import { useProtocolAddresses } from "@/lib/use-protocol-addresses";
import { usePropertyShareList } from "@/lib/usePropertyShareList";
import { getEstimatedYieldPercent } from "@/lib/demo-properties";
import { BCC_DISCOUNT_LABEL, BCC_SYMBOL } from "@/lib/contracts";

function parseShareFloat(wei: bigint): number {
  const s = formatEther(wei);
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : 0;
}

export default function PortfolioPage() {
  const { address, isConnected } = useAccount();
  const [watchlistIds, setWatchlistIds] = useState<string[]>([]);

  const refreshWatchlist = useCallback(async () => {
    if (!address) return;
    const res = await fetch(`/api/watchlist?wallet=${address}`);
    if (res.ok) {
      const data = (await res.json()) as { propertyIds: string[] };
      setWatchlistIds(data.propertyIds);
    }
  }, [address]);

  useEffect(() => {
    void refreshWatchlist();
  }, [refreshWatchlist]);
  const { weth } = useProtocolAddresses();

  const { data: nativeBal } = useBalance({ address, query: { enabled: !!address } });

  const { chainRows: rows, loading, unset } = usePropertyShareList();

  const balanceReads = useMemo(
    () =>
      address
        ? rows.map((r) => ({
            address: r.tokenAddress,
            abi: erc20Abi,
            functionName: "balanceOf" as const,
            args: [address] as const,
          }))
        : [],
    [rows, address],
  );

  const { data: balanceRows, isPending: loadingBalances } = useReadContracts({
    contracts: balanceReads,
    query: { enabled: !!address && balanceReads.length > 0 },
  });

  const wethRead = useMemo(
    () =>
      address && weth !== zeroAddress
        ? [
            {
              address: weth,
              abi: erc20Abi,
              functionName: "balanceOf" as const,
              args: [address] as const,
            },
          ]
        : [],
    [weth, address],
  );

  const { data: wethBalData } = useReadContracts({
    contracts: wethRead,
    query: { enabled: !!address && wethRead.length > 0 },
  });

  const wethBalance = wethBalData?.[0]?.status === "success" ? (wethBalData[0].result as bigint) : undefined;

  const withBalances = useMemo(() => {
    if (!balanceRows?.length) return rows.map((r) => ({ ...r, balance: undefined as bigint | undefined }));
    return rows.map((r, i) => {
      const row = balanceRows[i];
      const bal =
        row?.status === "success" && typeof row.result === "bigint" ? row.result : undefined;
      return { ...r, balance: bal };
    });
  }, [rows, balanceRows]);

  const { totalUsdEst, positions } = useMemo(() => {
    let total = 0;
    const pos: { id: string; label: string; pct: number; usd: number; shares: number }[] = [];
    for (const r of withBalances) {
      const bal = r.balance ?? 0n;
      if (bal === 0n) continue;
      const shares = parseShareFloat(bal);
      const px = r.demo?.illustrativeShareUsd ?? 0;
      const usd = shares * px;
      total += usd;
      pos.push({
        id: r.id.toString(),
        label: r.demo?.headline ?? r.name,
        pct: 0,
        usd,
        shares,
      });
    }
    for (const p of pos) {
      p.pct = total > 0 ? Math.round((p.usd / total) * 1000) / 10 : 0;
    }
    return { totalUsdEst: total, positions: pos };
  }, [withBalances]);

  const hasAnyShare = withBalances.some((r) => (r.balance ?? 0n) > 0n);

  const annualYieldIllustrUsd = useMemo(() => {
    let sum = 0;
    for (const r of withBalances) {
      const bal = r.balance ?? 0n;
      if (bal === 0n || !r.demo) continue;
      const usd = parseShareFloat(bal) * (r.demo.illustrativeShareUsd ?? 0);
      const y = getEstimatedYieldPercent(r.demo);
      sum += usd * (y / 100);
    }
    return sum;
  }, [withBalances]);

  return (
    <div className="mx-auto w-full max-w-[1280px] space-y-12 pb-16">
      <header className="space-y-3 text-center sm:text-left">
        <p className="mono-label !text-bc-lime">Investor dashboard</p>
        <h1 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">Your RWA portfolio</h1>
        <p className="max-w-2xl text-sm leading-relaxed text-muted">
          Total invested, yield references, NFT/share holdings, and {BCC_SYMBOL} benefits. USD uses per-share references — not
          mark-to-market.{" "}
          <Link href="/marketplace" className="text-bc-cyan hover:underline">
            Browse marketplace
          </Link>
        </p>
      </header>
      <ComplianceStatus />
      <TrustSection />

      {!isConnected ? (
        <p className="text-center text-zinc-500">Connect a wallet to see balances.</p>
      ) : unset ? (
        <p className="text-zinc-400">Configure registry and share factory to list properties.</p>
      ) : loading && rows.length === 0 ? (
        <p className="text-zinc-500">Loading…</p>
      ) : (
        <>
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-2xl border border-eco/20 bg-forest/30 p-6">
              <p className="text-xs uppercase tracking-wide text-muted">Portfolio value (ref.)</p>
              <p className="mt-2 font-mono text-2xl tabular-nums text-action-light">
                {hasAnyShare
                  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                      totalUsdEst,
                    )
                  : "—"}
              </p>
              <p className="mt-2 text-xs text-muted">Reference mark — not NAV.</p>
            </div>
            <div className="rounded-2xl border border-eco/20 bg-forest/30 p-6">
              <p className="text-xs uppercase tracking-wide text-muted">Properties owned</p>
              <p className="mt-2 font-mono text-2xl tabular-nums text-canvas">{positions.length}</p>
              <p className="mt-2 text-xs text-muted">Positions with share balance.</p>
            </div>
            <div className="rounded-2xl border border-eco/20 bg-forest/30 p-6">
              <p className="text-xs uppercase tracking-wide text-muted">Est. yield / yr (ref.)</p>
              <p className="mt-2 font-mono text-2xl tabular-nums text-eco-light">
                {hasAnyShare && annualYieldIllustrUsd > 0
                  ? new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(
                      annualYieldIllustrUsd,
                    )
                  : "—"}
              </p>
              <p className="mt-2 text-xs text-muted">From reference yields × position — not distributed on-chain.</p>
            </div>
            <div className="rounded-2xl border border-eco/20 bg-forest/30 p-6">
              <p className="text-xs uppercase tracking-wide text-muted">Token balances</p>
              <p className="mt-2 font-mono text-sm text-canvas">
                OG: {nativeBal ? formatEther(nativeBal.value) : "—"}
              </p>
              <p className="mt-1 font-mono text-sm text-canvas">
                WETH: {wethBalance !== undefined ? formatEther(wethBalance) : loadingBalances ? "…" : "0"}
              </p>
              <p className="mt-2 text-xs text-muted">Native + wrapped for swaps / pools.</p>
            </div>
          </div>

          {isConnected && hasAnyShare && <PortfolioIllustrativeCharts totalUsdEst={totalUsdEst} />}

          {hasAnyShare && positions.length > 0 && (
            <div className="glass-card p-6">
              <h2 className="text-sm font-medium text-white">Diversification</h2>
              <p className="mt-1 text-xs text-zinc-500">Share of estimated reference exposure by property.</p>
              <div className="mt-4 flex h-3 w-full overflow-hidden rounded-full bg-forest-deep">
                {positions.map((p, i) => (
                  <div
                    key={p.id}
                    title={`${p.label}: ${p.pct}%`}
                    className="h-full bg-gradient-to-t from-eco to-eco-light transition-all"
                    style={{
                      width: `${p.pct}%`,
                      opacity: 0.9 - i * 0.05,
                    }}
                  />
                ))}
              </div>
              <ul className="mt-4 space-y-2 text-sm">
                {positions.map((p) => (
                  <li key={p.id} className="flex justify-between text-zinc-400">
                    <span className="text-zinc-300">{p.label}</span>
                    <span className="font-mono text-xs">
                      {p.pct}% ·{" "}
                      {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(p.usd)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="space-y-3">
            <h2 className="text-lg font-semibold text-white">Property holdings</h2>
            {rows.length === 0 ? (
              <p className="text-sm text-zinc-500">No share tokens deployed yet.</p>
            ) : !hasAnyShare && !loadingBalances ? (
              <p className="text-sm text-zinc-500">No share balances yet.</p>
            ) : null}
            <div className="space-y-2">
              {withBalances.map((r) => {
                const usdEst =
                  r.balance && r.demo?.illustrativeShareUsd != null
                    ? parseShareFloat(r.balance) * r.demo.illustrativeShareUsd
                    : null;
                return (
                  <div
                    key={r.id.toString()}
                    className="glass-card flex flex-wrap items-center gap-3 p-4"
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
                      <p className="text-sm font-medium text-zinc-100">{r.demo?.headline ?? r.name}</p>
                      <p className="text-xs text-zinc-500">{r.symbol}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-mono text-sm text-white">
                        {r.balance !== undefined ? formatEther(r.balance) : "…"} shares
                      </p>
                      {usdEst != null && (
                        <p className="text-[11px] text-zinc-500">
                          ~{" "}
                          {new Intl.NumberFormat("en-US", { style: "currency", currency: "USD", maximumFractionDigits: 0 }).format(usdEst)}{" "}
                          ref.
                        </p>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="bc-glass-strong rounded-2xl p-6">
            <h2 className="text-sm font-medium text-white">{BCC_SYMBOL} benefits</h2>
            <p className="mt-2 text-xs leading-relaxed text-zinc-500">
              Hold {BCC_SYMBOL} for {BCC_DISCOUNT_LABEL} on eligible primary share purchases. Use the Buy {BCC_SYMBOL} button in
              the site chrome when configured.
            </p>
          </div>

          {watchlistIds.length > 0 ? (
            <div className="bc-glass rounded-2xl p-6">
              <h2 className="text-sm font-medium text-white">Watchlist</h2>
              <ul className="mt-3 space-y-2">
                {watchlistIds.map((pid) => (
                  <li key={pid}>
                    <Link href={`/marketplace/${pid}`} className="text-sm text-bc-cyan hover:underline">
                      Property #{pid}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}

          <div className="glass-card border-dashed border-eco/30 p-6">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-sm font-medium text-white">Yield & rewards</h2>
                <p className="mt-1 text-xs leading-relaxed text-zinc-500">
                  Claimable rewards and rental income follow issuer policy. Stake native ETH for protocol rewards where enabled.
                </p>
              </div>
              <Link
                href="/stake"
                className="rounded-full border border-bc-lime/40 px-4 py-2 text-xs font-medium text-bc-lime hover:bg-bc-lime/10"
              >
                Staking →
              </Link>
            </div>
          </div>

          <div className="flex flex-wrap justify-center gap-4 text-sm">
            <Link href="/trade" className="text-action hover:underline">
              Buy more shares
            </Link>
            <Link href="/pool" className="text-zinc-400 hover:text-white">
              Add liquidity
            </Link>
          </div>
        </>
      )}
    </div>
  );
}
