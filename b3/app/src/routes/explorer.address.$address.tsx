import { Link, createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Bot, CheckCircle2, Clock, ExternalLink, Wallet, XCircle } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { explorerAddressUrl } from "@/lib/explorer";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { AddressBadge } from "@/modules/explorer/AddressBadge";
import { ExplorerSearch } from "@/modules/explorer/ExplorerSearch";
import {
  TX_KIND_LABELS,
  shortAddress,
  timeAgo,
  type AddressOverview,
  type AddressRecentTx,
} from "@/modules/explorer/lib";

export const Route = createFileRoute("/explorer/address/$address")({
  head: ({ params }) =>
    pageHead({
      title: `Wallet ${shortAddress(params.address)} explained — ${BRAND_DISPLAY_NAME}`,
      description: "What this Base wallet holds and what it has been doing, in plain language.",
      path: `/explorer/address/${params.address}`,
    }),
  component: AddressProfilePage,
});

type AddressResponse = AddressOverview | { ok: false; error: string };

function RecentTxRow({ tx }: { tx: AddressRecentTx }) {
  const statusIcon =
    tx.status === "success" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-400" aria-hidden />
    ) : tx.status === "failed" ? (
      <XCircle className="h-4 w-4 text-red-400" aria-hidden />
    ) : (
      <Clock className="h-4 w-4 text-amber-400" aria-hidden />
    );

  return (
    <Link
      to="/explorer/tx/$hash"
      params={{ hash: tx.hash }}
      className="flex items-start gap-3 rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3 transition hover:border-white/[0.16] hover:bg-black/50"
    >
      <span className="mt-0.5 shrink-0">{statusIcon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-sm leading-snug text-zinc-200">{tx.summary}</p>
        <div className="mt-1.5 flex flex-wrap items-center gap-2">
          <Badge
            variant="outline"
            className="border-white/[0.12] px-2 py-0 font-mono text-[10px] uppercase tracking-wider text-zinc-400"
          >
            {TX_KIND_LABELS[tx.kind].label}
          </Badge>
          {tx.ecosystemTags.slice(0, 2).map((tag) => (
            <Badge
              key={tag}
              variant="outline"
              className="border-[var(--vault-gold)]/30 px-2 py-0 font-mono text-[10px] uppercase tracking-wider text-[var(--vault-gold)]"
            >
              {tag}
            </Badge>
          ))}
          {tx.timestamp ? (
            <span className="text-[11px] text-zinc-500">{timeAgo(tx.timestamp)}</span>
          ) : null}
        </div>
      </div>
    </Link>
  );
}

function AddressProfilePage() {
  const { address } = Route.useParams();

  const { data, isLoading } = useQuery({
    queryKey: ["explorer-address", address],
    queryFn: async (): Promise<AddressResponse> => {
      const res = await fetch(`/api/explorer/address/${address}`);
      return (await res.json()) as AddressResponse;
    },
  });

  const overview = data && data.ok ? (data as AddressOverview) : null;

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4">
        <Link
          to="/explorer"
          className="inline-flex w-fit items-center gap-1.5 text-xs text-zinc-500 transition hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" aria-hidden /> Back to explorer
        </Link>
        <ExplorerSearch />
      </div>

      {isLoading ? (
        <div className="space-y-4">
          <Skeleton className="h-32 w-full rounded-2xl" />
          <Skeleton className="h-40 w-full rounded-2xl" />
          <Skeleton className="h-56 w-full rounded-2xl" />
        </div>
      ) : null}

      {!isLoading && !overview ? (
        <div className="rounded-2xl border border-white/[0.06] bg-black/30 px-6 py-10 text-center">
          <p className="font-heading text-lg font-semibold text-white">
            We couldn't load that wallet right now
          </p>
          <p className="mx-auto mt-2 max-w-md text-sm text-zinc-500">
            The address looks valid, but the data source didn't answer. Please try again in a
            moment.
          </p>
        </div>
      ) : null}

      {overview ? (
        <>
          <section className="rounded-2xl border border-white/[0.06] bg-black/30 p-5 md:p-6">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex items-start gap-3">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/[0.1] bg-black/50 text-[var(--base-blue)]">
                  {overview.isContract ? (
                    <Bot className="h-5 w-5" aria-hidden />
                  ) : (
                    <Wallet className="h-5 w-5" aria-hidden />
                  )}
                </span>
                <div>
                  <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                    {overview.isContract ? "Smart contract" : "Wallet"}
                  </p>
                  <h1 className="font-heading text-xl font-semibold text-white md:text-2xl">
                    {overview.label ?? shortAddress(overview.address)}
                  </h1>
                  <div className="mt-2">
                    <AddressBadge
                      address={overview.address}
                      ecosystem={overview.known?.ecosystem}
                      link={false}
                    />
                  </div>
                  {overview.known?.description ? (
                    <p className="mt-3 max-w-lg text-sm leading-relaxed text-zinc-400">
                      {overview.known.description}
                    </p>
                  ) : null}
                </div>
              </div>
              <a
                href={explorerAddressUrl(overview.chainId, overview.address)}
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.12] bg-black/50 px-3.5 py-1.5 font-mono text-[11px] text-zinc-300 transition hover:border-white/30 hover:text-white"
              >
                Basescan <ExternalLink className="h-3 w-3 opacity-70" aria-hidden />
              </a>
            </div>

            {overview.ethBalance != null ? (
              <div className="mt-5 rounded-xl border border-white/[0.06] bg-white/[0.03] px-4 py-3">
                <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                  ETH balance
                </p>
                <p className="mt-1 font-heading text-lg font-semibold text-white">
                  {overview.ethBalance} ETH
                  {overview.ethBalanceUsd != null ? (
                    <span className="ml-2 text-sm font-normal text-zinc-500">
                      ≈ ${overview.ethBalanceUsd.toLocaleString("en-US")}
                    </span>
                  ) : null}
                </p>
              </div>
            ) : null}
          </section>

          {overview.holdings.length > 0 ? (
            <section>
              <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
                What this wallet holds
              </h2>
              <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
                {overview.holdings.map((h, i) => (
                  <div
                    key={`${h.address ?? h.symbol}-${i}`}
                    className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-3"
                  >
                    <p className="truncate text-xs text-zinc-500">{h.name ?? h.symbol}</p>
                    <p className="mt-1 font-heading text-sm font-semibold text-white">
                      {h.kind === "nft"
                        ? `${h.amountFormatted} × ${h.symbol}`
                        : `${h.amountFormatted} ${h.symbol}`}
                    </p>
                    {h.usdValue != null ? (
                      <p className="mt-0.5 text-[11px] text-zinc-500">
                        ≈ ${h.usdValue.toLocaleString("en-US")}
                      </p>
                    ) : null}
                  </div>
                ))}
              </div>
            </section>
          ) : null}

          <section>
            <h2 className="mb-3 font-mono text-[11px] uppercase tracking-[0.22em] text-zinc-400">
              What it has been doing lately
            </h2>
            {overview.recentTxs.length > 0 ? (
              <div className="space-y-2">
                {overview.recentTxs.map((tx) => (
                  <RecentTxRow key={tx.hash} tx={tx} />
                ))}
              </div>
            ) : (
              <p className="rounded-xl border border-white/[0.06] bg-black/30 px-4 py-6 text-center text-sm text-zinc-500">
                No recent activity found for this address.
              </p>
            )}
          </section>
        </>
      ) : null}
    </div>
  );
}
