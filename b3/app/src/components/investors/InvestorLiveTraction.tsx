import { Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";

import type { InvestorTraction } from "@/server/investors/traction";

type TractionResponse = { ok: boolean; traction?: InvestorTraction };

type Row = { signal: string; value: string; note?: string };

function fmtInt(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  return n.toLocaleString("en-US");
}

function fmtUsd(n: number | null | undefined): string {
  if (n == null || !Number.isFinite(n)) return "—";
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
  if (n >= 10_000) return `$${Math.round(n).toLocaleString("en-US")}`;
  if (n >= 100) return `$${n.toFixed(0)}`;
  if (n >= 1) return `$${n.toFixed(2)}`;
  return `$${n.toFixed(4)}`;
}

function fmtBps(bps: number | null | undefined): string {
  if (bps == null || !Number.isFinite(bps)) return "—";
  return `${(bps / 100).toFixed(2)}%`;
}

function fmtBccSupply(wei: string | null | undefined): string {
  if (!wei) return "—";
  try {
    const whole = BigInt(wei) / 10n ** 18n;
    const frac = BigInt(wei) % 10n ** 18n;
    if (frac === 0n) return whole.toLocaleString("en-US");
    return `${whole.toLocaleString("en-US")}.${frac.toString().padStart(18, "0").replace(/0+$/, "").slice(0, 4)}`;
  } catch {
    return wei;
  }
}

function fmtCapturedAt(iso: string | undefined): string {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "medium",
      timeStyle: "short",
      timeZone: "UTC",
    });
  } catch {
    return iso;
  }
}

function boolLabel(on: boolean, configured?: boolean): string {
  if (!configured) return "not configured";
  return on ? "yes" : "no";
}

function MetricTable({ title, rows, loading }: { title: string; rows: Row[]; loading: boolean }) {
  return (
    <div className="space-y-3">
      <h3 className="font-mono text-[11px] uppercase tracking-[0.18em] text-zinc-500">{title}</h3>
      <div className="overflow-x-auto rounded-2xl border border-white/[0.08]">
        <table className="w-full min-w-[320px] text-left text-sm">
          <thead>
            <tr className="border-b border-white/[0.08] bg-white/[0.03] font-mono text-[10px] uppercase tracking-wider text-zinc-600">
              <th className="px-4 py-2.5 font-medium">Metric</th>
              <th className="px-4 py-2.5 font-medium">Count</th>
              <th className="px-4 py-2.5 font-medium">Notes</th>
            </tr>
          </thead>
          <tbody className="text-zinc-400">
            {rows.map((row) => (
              <tr key={row.signal} className="border-b border-white/[0.06] last:border-0">
                <td className="px-4 py-2.5 text-zinc-300">{row.signal}</td>
                <td className="px-4 py-2.5 font-mono tabular-nums text-zinc-200">
                  {loading ? (
                    <span className="inline-block h-4 w-12 animate-pulse rounded bg-white/10" />
                  ) : (
                    row.value
                  )}
                </td>
                <td className="px-4 py-2.5 text-xs text-zinc-600">{row.note ?? "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export function InvestorLiveTraction() {
  const { data, isLoading, isError, dataUpdatedAt } = useQuery({
    queryKey: ["investors", "traction"],
    queryFn: async () => {
      const res = await fetch("/api/investors/traction");
      if (!res.ok) throw new Error("traction_failed");
      return (await res.json()) as TractionResponse;
    },
    staleTime: 60_000,
    refetchInterval: 120_000,
  });

  const t = data?.traction;
  const product = t?.product;

  const productRows: Row[] = [
    {
      signal: "Member profiles (DB)",
      value: fmtInt(product?.members),
      note: "Wallet-first accounts in production Postgres",
    },
    {
      signal: "Members with wallet on file",
      value: fmtInt(product?.membersWithWallet),
      note: "Not MAU — cumulative sign-ups",
    },
    {
      signal: "Farcaster-linked members",
      value: fmtInt(product?.membersWithFarcaster),
      note: "FID stored on member row",
    },
    {
      signal: "Telegram-linked accounts",
      value: fmtInt(product?.membersWithTelegram),
      note: "SocialAccount platform=telegram",
    },
    {
      signal: "Waitlist signups",
      value: fmtInt(product?.waitlist),
      note: "waitlistEntry table",
    },
    {
      signal: "Culture Points (ledger net)",
      value: fmtInt(product?.culturePointsNet),
      note: "Sum of PointLedger.delta",
    },
    {
      signal: "Activity events (24h)",
      value: fmtInt(product?.activity24h),
      note: "ActivityEvent rows in last 24h",
    },
  ];

  const social = t?.social;
  const mints = t?.mints;
  const market = t?.market;

  const socialRows: Row[] = [
    {
      signal: "Ingested Farcaster posts",
      value: fmtInt(social?.ingestedPosts.farcaster),
      note: social?.streams.farcaster
        ? "NEYNAR_API_KEY set — feed may still be empty"
        : "stream off (no NEYNAR_API_KEY)",
    },
    {
      signal: "Ingested X posts",
      value: fmtInt(social?.ingestedPosts.x),
      note: social?.streams.x ? "X API credentials set" : "stream off",
    },
    {
      signal: "Ingested Meta / TikTok / IG",
      value: fmtInt(
        (social?.ingestedPosts.facebook ?? 0) +
          (social?.ingestedPosts.tiktok ?? 0) +
          (social?.ingestedPosts.instagram ?? 0),
      ),
      note: "Optional streams — mostly off in prod",
    },
    {
      signal: "Native pulse comments",
      value: fmtInt(social?.ingestedPosts.nativeComments),
      note: "Curated in-app comments",
    },
    {
      signal: "Verified social links (all platforms)",
      value: fmtInt(Object.values(social?.verifiedLinkedAccounts ?? {}).reduce((a, b) => a + b, 0)),
      note: "SocialAccount.verified=true",
    },
    {
      signal: "Grove outbound: X",
      value: boolLabel(!!social?.outbound.xConfigured, true),
      note: social?.outbound.xConfigured ? "API keys present" : "not configured — no auto-posts",
    },
    {
      signal: "Grove outbound: Farcaster",
      value: boolLabel(!!social?.outbound.farcasterConfigured, true),
      note: social?.outbound.farcasterConfigured
        ? "Neynar signer configured"
        : "not configured — no auto-posts",
    },
    {
      signal: "Grove outbound: Telegram",
      value: boolLabel(!!social?.outbound.telegramConfigured, true),
      note: social?.outbound.telegramConfigured ? "bot channel configured" : "not configured",
    },
  ];

  const mintRows: Row[] = [
    {
      signal: "BCC total supply (on-chain)",
      value: fmtBccSupply(mints?.onChain.bccTotalSupplyWei),
      note: "ERC-20 totalSupply on Base — fair launch, no inflationary mint",
    },
    {
      signal: "Raffle ticket NFTs minted",
      value: fmtInt(mints?.onChain.raffleTicketsMinted),
      note: "RaffleTicketCampaign.totalSupply()",
    },
    {
      signal: "Agent share NFTs minted",
      value: fmtInt(mints?.onChain.agentShareTokensMinted),
      note: "AgentShareCampaign.totalSupply()",
    },
    {
      signal: "Stripe pack purchases (app)",
      value: fmtInt(mints?.inApp.packPurchases),
      note:
        product?.packRevenueUsd && product.packRevenueUsd > 0
          ? `${fmtUsd(product.packRevenueUsd)} recorded USD`
          : "PackPurchase rows — revenue may be $0",
    },
    {
      signal: "Panic voucher NFTs minted (app)",
      value: fmtInt(mints?.inApp.panicVoucherMinted),
      note: `${fmtInt(mints?.inApp.panicVoucherPending)} pending in DB`,
    },
    {
      signal: "BCC settlements credited",
      value: fmtInt(product?.bccSettlementsCredited),
      note: `${fmtInt(product?.bccSettlementsPending)} pending treasury settlement`,
    },
    {
      signal: "Points → BCC redemptions",
      value: fmtInt(product?.pointRedemptions),
      note: "PointRedemption rows (gate usually off pre-TVL)",
    },
    {
      signal: "Marketplace listings live",
      value: fmtInt(market?.activeListings),
      note: "thirdweb Marketplace on Base",
    },
  ];

  const marketRows: Row[] = [
    {
      signal: "BCC Uniswap liquidity",
      value: fmtUsd(market?.combinedLiquidityUsd),
      note: "DexScreener via /api/market/bcc",
    },
    {
      signal: "BCC DEX volume (24h)",
      value: fmtUsd(market?.volume24hUsd),
      note: "Public pool data — not platform GMV",
    },
    {
      signal: "BCC pack discount (configured)",
      value: fmtBps(market?.discountBps),
      note: "VITE_BCC_DISCOUNT_BPS when packs enabled",
    },
  ];

  return (
    <section className="space-y-8">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <h2 className="font-heading text-xl font-semibold text-white md:text-2xl">
            What we can prove today
          </h2>
          <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-500">
            Every figure below is reproducible from production Postgres, public Base RPC reads, or
            documented APIs. We do not inflate social reach, mint counts, or GMV. Zeros mean zero —
            not “coming soon” marketing.
          </p>
        </div>
        <p className="shrink-0 font-mono text-[10px] uppercase tracking-wider text-zinc-600">
          {isLoading
            ? "Loading…"
            : isError
              ? "Refresh failed"
              : `Snapshot ${fmtCapturedAt(t?.capturedAt)} UTC`}
        </p>
      </div>

      <div className="rounded-2xl border border-amber-500/20 bg-amber-500/[0.05] px-5 py-4 text-sm text-amber-100/90">
        <strong className="font-medium text-amber-50">Honesty policy:</strong> Member counts are
        cumulative sign-ups, not monthly actives. Social post counts are{" "}
        <em>ingested items in our DB</em>, not follower counts. DEX volume is pool trading, not
        Building Culture revenue. The seed deck on{" "}
        <Link to="/plan" className="underline underline-offset-4">
          /plan
        </Link>{" "}
        uses illustrative scenarios — never substitute deck slides for this table.
      </div>

      <div className="grid gap-8 lg:grid-cols-2">
        <MetricTable title="Product & wallets" rows={productRows} loading={isLoading} />
        <MetricTable title="Social (real ingestion)" rows={socialRows} loading={isLoading} />
        <MetricTable title="Mints & commerce" rows={mintRows} loading={isLoading} />
        <MetricTable title="Market (public pools)" rows={marketRows} loading={isLoading} />
      </div>

      <p className="text-xs leading-relaxed text-zinc-600">
        Machine-readable bundle:{" "}
        <a
          href="/api/investors/traction"
          className="font-mono text-zinc-500 underline underline-offset-4 hover:text-zinc-300"
        >
          GET /api/investors/traction
        </a>
        . On-chain bytecode audit:{" "}
        <Link to="/grant-proof" className="text-zinc-400 underline underline-offset-4">
          /grant-proof
        </Link>
        . Client refresh:{" "}
        {dataUpdatedAt ? fmtCapturedAt(new Date(dataUpdatedAt).toISOString()) : "—"} UTC.
      </p>
    </section>
  );
}
