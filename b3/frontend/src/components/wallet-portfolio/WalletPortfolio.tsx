import { useQueries } from "@tanstack/react-query";
import { Insight } from "thirdweb";
import { Coins, ExternalLink, Hexagon, Loader2, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { INSIGHT_PORTFOLIO_CHAINS } from "@/lib/portfolio-chains";
import { explorerAddressUrl } from "@/lib/explorer";
import { ipfsToHttp } from "@/lib/ipfs-gateway";
import { cn } from "@/lib/utils";
import { getFeaturedCollectionLabel, getFeaturedCollectionThirdwebUrl } from "@/lib/pit-nft-config";

type Props = {
  address: `0x${string}`;
};

function chainBadge(chainId: number): string {
  if (chainId === 8453) return "Base";
  if (chainId === 84532) return "Base Sepolia";
  if (chainId === 56) return "BNB Chain";
  return `Chain ${chainId}`;
}

function nftTitle(nft: { metadata?: { name?: string }; id: bigint }): string {
  const name = nft.metadata?.name;
  if (typeof name === "string" && name.trim()) return name;
  return `#${nft.id.toString()}`;
}

export function WalletPortfolio({ address }: Props) {
  const featuredUrl = getFeaturedCollectionThirdwebUrl();
  const featuredLabel = getFeaturedCollectionLabel();
  const chains = [...INSIGHT_PORTFOLIO_CHAINS];

  const [tokensQuery, nftsQuery] = useQueries({
    queries: [
      {
        queryKey: ["insight-tokens", address, chains.map((c) => c.id)],
        queryFn: async () => {
          if (!thirdwebClient) throw new Error("no_client");
          return Insight.getOwnedTokens({
            client: thirdwebClient,
            chains,
            ownerAddress: address,
            queryOptions: { limit: 100, sort_by: "balance", sort_order: "desc" },
          });
        },
        enabled: !!thirdwebClient && !!address,
        staleTime: 60_000,
      },
      {
        queryKey: ["insight-nfts", address, chains.map((c) => c.id)],
        queryFn: async () => {
          if (!thirdwebClient) throw new Error("no_client");
          return Insight.getOwnedNFTs({
            client: thirdwebClient,
            chains,
            ownerAddress: address,
            queryOptions: { limit: 100, page: 0 },
          });
        },
        enabled: !!thirdwebClient && !!address,
        staleTime: 60_000,
      },
    ],
  });

  const loading = tokensQuery.isPending || nftsQuery.isPending;
  const refetching = tokensQuery.isFetching || nftsQuery.isFetching;
  const error =
    tokensQuery.error || nftsQuery.error
      ? String(
          tokensQuery.error instanceof Error
            ? tokensQuery.error.message
            : nftsQuery.error instanceof Error
              ? nftsQuery.error.message
              : "Failed to load portfolio",
        )
      : null;

  const tokens = tokensQuery.data ?? [];
  const nfts = nftsQuery.data ?? [];

  if (!thirdwebClient) {
    return (
      <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] px-4 py-3 text-sm text-amber-100/90">
        Set <span className="font-mono">VITE_THIRDWEB_CLIENT_ID</span> to load on-chain portfolio
        data (thirdweb Insight).
      </div>
    );
  }

  return (
    <section className="relative overflow-hidden rounded-[20px] border border-white/[0.08] bg-gradient-to-b from-white/[0.07] via-transparent to-black/20 p-[1px] shadow-[0_0_0_1px_rgba(255,255,255,0.04)]">
      <div className="rounded-[19px] bg-[#0c0d12]/90 backdrop-blur-xl">
        <div className="flex flex-col gap-4 border-b border-white/[0.06] px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="font-heading text-lg font-semibold tracking-tight text-white">
              Portfolio
            </p>
            <p className="text-xs text-zinc-500">
              Tokens & NFTs on Base via <span className="text-zinc-400">thirdweb Insight</span>
            </p>
            {featuredUrl ? (
              <a
                href={featuredUrl}
                target="_blank"
                rel="noreferrer"
                className="mt-2 inline-flex items-center gap-1.5 font-mono text-[11px] text-[var(--base-blue)] transition hover:text-white"
              >
                {featuredLabel} on thirdweb
                <ExternalLink className="h-3 w-3 opacity-70" />
              </a>
            ) : null}
          </div>
          <Button
            type="button"
            variant="outline"
            size="sm"
            disabled={loading || refetching}
            onClick={() => {
              void tokensQuery.refetch();
              void nftsQuery.refetch();
            }}
            className="shrink-0 gap-2 rounded-full border-white/10 bg-white/[0.04] font-mono text-[11px] uppercase tracking-wider text-zinc-300 hover:bg-white/[0.08]"
          >
            {refetching ? (
              <Loader2 className="h-3.5 w-3.5 animate-spin" />
            ) : (
              <RefreshCw className="h-3.5 w-3.5" />
            )}
            Refresh
          </Button>
        </div>

        <Tabs defaultValue="tokens" className="w-full">
          <div className="px-5 pt-4">
            <TabsList className="grid h-11 w-full max-w-md grid-cols-2 rounded-full border border-white/[0.07] bg-black/30 p-1">
              <TabsTrigger
                value="tokens"
                className="gap-2 rounded-full font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              >
                <Coins className="h-3.5 w-3.5 opacity-70" />
                Tokens
              </TabsTrigger>
              <TabsTrigger
                value="nfts"
                className="gap-2 rounded-full font-mono text-[11px] uppercase tracking-[0.16em] text-zinc-500 data-[state=active]:bg-white/[0.08] data-[state=active]:text-white data-[state=active]:shadow-[inset_0_0_0_1px_rgba(255,255,255,0.08)]"
              >
                <Hexagon className="h-3.5 w-3.5 opacity-70" />
                NFTs
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="tokens" className="mt-0 px-5 pb-5 pt-4 outline-none">
            {loading ? (
              <TokenSkeleton />
            ) : error ? (
              <p className="text-sm text-red-400/90">{error}</p>
            ) : tokens.length === 0 ? (
              <Empty label="No token balances indexed yet for this wallet on Base networks." />
            ) : (
              <ul className="space-y-2">
                {tokens.map((t, i) => (
                  <li
                    key={`${t.chainId}-${t.tokenAddress}-${i}`}
                    className="group flex items-center justify-between gap-3 rounded-xl border border-white/[0.05] bg-white/[0.02] px-4 py-3 transition hover:border-[var(--base-blue)]/35 hover:bg-white/[0.04]"
                  >
                    <div className="flex min-w-0 items-center gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-gradient-to-br from-[#31353e] to-[#1a1d24] font-heading text-sm font-bold text-white shadow-inner ring-1 ring-white/10">
                        {(t.symbol || "?").slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <p className="truncate font-medium text-zinc-100">{t.name || t.symbol}</p>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="font-mono text-[11px] text-zinc-500">{t.symbol}</span>
                          <span className="rounded-full bg-white/[0.06] px-2 py-0.5 font-mono text-[10px] uppercase tracking-wide text-zinc-400">
                            {chainBadge(t.chainId)}
                          </span>
                          <a
                            href={explorerAddressUrl(t.chainId, t.tokenAddress)}
                            target="_blank"
                            rel="noreferrer"
                            className="truncate font-mono text-[10px] text-[var(--base-blue)] opacity-70 underline-offset-2 hover:opacity-100"
                          >
                            {t.tokenAddress.slice(0, 6)}…{t.tokenAddress.slice(-4)}
                          </a>
                        </div>
                      </div>
                    </div>
                    <p className="shrink-0 font-mono text-sm tabular-nums tracking-tight text-white">
                      {t.displayValue}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </TabsContent>

          <TabsContent value="nfts" className="mt-0 px-5 pb-5 pt-4 outline-none">
            {loading ? (
              <NftSkeleton />
            ) : error ? (
              <p className="text-sm text-red-400/90">{error}</p>
            ) : nfts.length === 0 ? (
              <Empty label="No NFTs indexed yet for this wallet on Base networks." />
            ) : (
              <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {nfts.map((nft, i) => {
                  const img = ipfsToHttp(
                    typeof nft.metadata?.image === "string" ? nft.metadata.image : undefined,
                  );
                  const qty =
                    "quantityOwned" in nft && nft.quantityOwned !== undefined
                      ? nft.quantityOwned
                      : 1n;
                  return (
                    <li key={`${nft.chainId}-${nft.tokenAddress}-${nft.id}-${i}`}>
                      <a
                        href={explorerAddressUrl(nft.chainId, nft.tokenAddress)}
                        target="_blank"
                        rel="noreferrer"
                        className={cn(
                          "group block overflow-hidden rounded-xl border border-white/[0.06] bg-black/40 transition",
                          "hover:border-[var(--base-blue)]/40 hover:shadow-[0_12px_40px_-16px_rgba(0,82,255,0.55)]",
                        )}
                      >
                        <div className="relative aspect-square bg-gradient-to-br from-white/[0.06] to-transparent">
                          {img ? (
                            <img
                              src={img}
                              alt=""
                              className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.03]"
                              loading="lazy"
                            />
                          ) : (
                            <div className="flex h-full items-center justify-center font-mono text-[10px] text-zinc-600">
                              No media
                            </div>
                          )}
                          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent px-2 pb-2 pt-8">
                            <p className="truncate font-heading text-[13px] font-semibold text-white">
                              {nftTitle(nft)}
                            </p>
                            <div className="mt-0.5 flex items-center justify-between gap-1">
                              <span className="rounded bg-black/50 px-1.5 py-0.5 font-mono text-[9px] uppercase tracking-wider text-zinc-300">
                                {chainBadge(nft.chainId)}
                              </span>
                              {nft.type === "ERC1155" && qty > 1n ? (
                                <span className="font-mono text-[10px] text-zinc-400">
                                  ×{qty.toString()}
                                </span>
                              ) : (
                                <span className="font-mono text-[10px] text-zinc-500">
                                  #{nft.id.toString()}
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </a>
                    </li>
                  );
                })}
              </ul>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </section>
  );
}

function Empty({ label }: { label: string }) {
  return (
    <p className="rounded-xl border border-dashed border-white/10 bg-black/20 px-4 py-8 text-center text-sm text-zinc-500">
      {label}
    </p>
  );
}

function TokenSkeleton() {
  return (
    <div className="space-y-2">
      {Array.from({ length: 5 }).map((_, i) => (
        <div
          key={i}
          className="flex animate-pulse items-center justify-between gap-3 rounded-xl border border-white/[0.04] bg-white/[0.02] px-4 py-3"
        >
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-zinc-800" />
            <div className="space-y-2">
              <div className="h-3 w-28 rounded bg-zinc-800" />
              <div className="h-2 w-40 rounded bg-zinc-800/80" />
            </div>
          </div>
          <div className="h-4 w-16 rounded bg-zinc-800" />
        </div>
      ))}
    </div>
  );
}

function NftSkeleton() {
  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
      {Array.from({ length: 6 }).map((_, i) => (
        <div key={i} className="aspect-square animate-pulse rounded-xl bg-zinc-800/80" />
      ))}
    </div>
  );
}
