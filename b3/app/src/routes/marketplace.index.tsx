import { useMemo, useState } from "react";
import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useQuery } from "@tanstack/react-query";
import { useChainId } from "wagmi";
import {
  Building2,
  ExternalLink,
  Search,
  Sparkles,
  ArrowDownWideNarrow,
  ArrowUpWideNarrow,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Skeleton } from "@/components/ui/skeleton";
import { getContract } from "thirdweb";
import { getAllValidListings } from "thirdweb/extensions/marketplace";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { thirdwebChainFromId } from "@/lib/thirdweb-chain";
import { getMarketplaceContractAddress } from "@/lib/marketplace-config";
import { getMarketplaceChain, parseMarketplaceNetwork } from "@/lib/chains";
import {
  getFeaturedCollectionLabel,
  getPitNftContractAddress,
  isPitAsset,
} from "@/lib/pit-nft-config";
import { assertMarketplaceBytecode, mapMarketplaceRpcError } from "@/lib/marketplace-read-guard";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/marketplace/")({
  head: () =>
    pageHead({
      title: `Marketplace — ${BRAND_DISPLAY_NAME}`,
      description:
        "Buy and sell NFT listings on Base — Build Culture marketplace powered by thirdweb Marketplace V3.",
      path: "/marketplace",
      keywords: ["Build Culture", "marketplace", "Base", "NFT", "listings"],
    }),
  component: MarketplaceIndexPage,
});

function listingPriceNumber(listing: { currencyValuePerToken: { displayValue: string } }): number {
  const raw = listing.currencyValuePerToken.displayValue;
  const n = Number(raw);
  return Number.isFinite(n) ? n : 0;
}

function shortAddr(a: string): string {
  if (a.length < 12) return a;
  return `${a.slice(0, 6)}…${a.slice(-4)}`;
}

function ListingCardSkeleton() {
  return (
    <div className="glass overflow-hidden rounded-xl border border-white/10">
      <Skeleton className="aspect-[4/3] w-full rounded-none" />
      <div className="space-y-2 p-4">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/3" />
        <Skeleton className="h-3 w-full" />
      </div>
    </div>
  );
}

function MarketplaceIndexPage() {
  const chainId = useChainId();
  const marketplaceChain = getMarketplaceChain();
  const marketplaceAddress = getMarketplaceContractAddress();
  const pitAddr = getPitNftContractAddress();
  const featuredLabel = getFeaturedCollectionLabel();
  const [listingFilter, setListingFilter] = useState<"all" | "pit">("all");
  const [search, setSearch] = useState("");
  const [sort, setSort] = useState<"price_asc" | "price_desc">("price_asc");

  const {
    data: listings,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["marketplace-listings", marketplaceChain.id, marketplaceAddress],
    queryFn: async () => {
      if (!thirdwebClient || !marketplaceAddress) return [];
      const contract = getContract({
        client: thirdwebClient,
        chain: thirdwebChainFromId(marketplaceChain.id),
        address: marketplaceAddress,
      });
      try {
        await assertMarketplaceBytecode(contract, marketplaceChain.name);
        return await getAllValidListings({ contract, count: 100n });
      } catch (e) {
        throw mapMarketplaceRpcError(e);
      }
    },
    enabled: !!thirdwebClient && !!marketplaceAddress && chainId === marketplaceChain.id,
  });

  const wrongChain = chainId !== marketplaceChain.id;

  const pitFiltered = useMemo(() => {
    if (!listings?.length) return listings;
    if (listingFilter !== "pit" || !pitAddr) return listings;
    return listings.filter((l) =>
      isPitAsset(typeof l.assetContractAddress === "string" ? l.assetContractAddress : undefined),
    );
  }, [listings, listingFilter, pitAddr]);

  const processedListings = useMemo(() => {
    if (!pitFiltered?.length) return pitFiltered;
    let rows = [...pitFiltered];
    const q = search.trim().toLowerCase();
    if (q) {
      rows = rows.filter((l) => {
        const title = (l.asset.metadata?.name ?? "").toString().toLowerCase();
        const contract = (l.assetContractAddress ?? "").toLowerCase();
        return title.includes(q) || contract.includes(q);
      });
    }
    rows.sort((a, b) => {
      const pa = listingPriceNumber(a);
      const pb = listingPriceNumber(b);
      return sort === "price_asc" ? pa - pb : pb - pa;
    });
    return rows;
  }, [pitFiltered, search, sort]);

  const marketplaceNetworkLabel = parseMarketplaceNetwork();

  return (
    <div className="space-y-8">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
        <div className="flex items-start gap-3">
          <Building2 className="mt-0.5 h-8 w-8 shrink-0 text-neon" aria-hidden />
          <div>
            <h2 className="font-heading text-xl font-bold text-foreground md:text-2xl">
              NFT listings
            </h2>
            <p className="mt-1 max-w-xl text-sm text-muted-foreground">
              Browse secondary listings on {marketplaceChain.name}. To list your own asset, use{" "}
              <Link to="/marketplace/sell" className="text-neon underline underline-offset-2">
                Sell an NFT
              </Link>
              .
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <div className="relative min-w-[200px] flex-1 sm:max-w-md">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-zinc-500" />
          <Input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title or contract…"
            className="h-11 rounded-full border-white/10 bg-black/40 pl-10"
            aria-label="Search listings"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            type="button"
            variant={sort === "price_asc" ? "secondary" : "outline"}
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setSort("price_asc")}
          >
            <ArrowUpWideNarrow className="h-4 w-4" aria-hidden />
            Price low
          </Button>
          <Button
            type="button"
            variant={sort === "price_desc" ? "secondary" : "outline"}
            size="sm"
            className="rounded-full gap-1.5"
            onClick={() => setSort("price_desc")}
          >
            <ArrowDownWideNarrow className="h-4 w-4" aria-hidden />
            Price high
          </Button>
        </div>
      </div>

      {!thirdwebClient && (
        <p className="rounded-lg border border-amber-500/30 bg-amber-500/10 px-4 py-3 text-sm text-foreground">
          Set <span className="font-mono">VITE_THIRDWEB_CLIENT_ID</span> to enable thirdweb
          marketplace reads.
        </p>
      )}

      {!marketplaceAddress && (
        <p className="rounded-lg border border-muted px-4 py-3 text-sm text-muted-foreground">
          Deploy a thirdweb Marketplace on {marketplaceChain.name} and set{" "}
          <span className="font-mono">VITE_MARKETPLACE_CONTRACT_ADDRESS</span>. Optional:{" "}
          <span className="font-mono">VITE_MARKETPLACE_NETWORK=base</span> (defaults to Base
          mainnet; use <code>base-sepolia</code> only for test contracts — currently{" "}
          <span className="font-semibold">{marketplaceNetworkLabel}</span>
          ).
        </p>
      )}

      {wrongChain && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          Switch network to <span className="font-semibold">{marketplaceChain.name}</span> using the
          wallet menu to load listings.
        </p>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load listings"}
        </p>
      )}

      {isLoading && (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {Array.from({ length: 6 }).map((_, i) => (
            <ListingCardSkeleton key={`sk-${i}`} />
          ))}
        </div>
      )}

      {!isLoading && listings && listings.length === 0 && marketplaceAddress && !wrongChain && (
        <div className="rounded-xl border border-white/10 bg-black/20 p-6 text-sm space-y-4">
          <p className="font-medium text-foreground">No active listings yet.</p>
          <p className="text-muted-foreground">
            Be the first seller: create an on-chain listing (approve the marketplace contract, then
            publish your price).
          </p>
          <Button variant="secondary" className="rounded-full" asChild>
            <Link to="/marketplace/sell">Sell an NFT</Link>
          </Button>
          <ol className="list-decimal space-y-2 pl-5 text-muted-foreground">
            <li>
              Deploy / manage your ERC-721 on{" "}
              <a
                href="https://thirdweb.com/dashboard"
                target="_blank"
                rel="noreferrer"
                className="font-mono text-neon underline inline-flex items-center gap-1"
              >
                thirdweb dashboard <ExternalLink className="h-3 w-3" />
              </a>
            </li>
            <li>
              Use{" "}
              <Link to="/marketplace/sell" className="text-neon underline">
                Sell an NFT
              </Link>{" "}
              in this app to approve + list — or use the dashboard.
            </li>
          </ol>
        </div>
      )}

      {pitAddr && listings && listings.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => setListingFilter("all")}
            className={`rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
              listingFilter === "all"
                ? "bg-[var(--base-blue)]/25 text-foreground ring-1 ring-[var(--base-blue)]/50"
                : "border border-white/10 text-muted-foreground hover:border-white/20"
            }`}
          >
            All listings
          </button>
          <button
            type="button"
            onClick={() => setListingFilter("pit")}
            className={`inline-flex items-center gap-1.5 rounded-full px-4 py-1.5 font-mono text-[11px] uppercase tracking-wide transition ${
              listingFilter === "pit"
                ? "bg-[var(--base-blue)]/25 text-foreground ring-1 ring-[var(--base-blue)]/50"
                : "border border-white/10 text-muted-foreground hover:border-white/20"
            }`}
          >
            <Sparkles className="h-3.5 w-3.5" />
            {featuredLabel} only
          </button>
        </div>
      )}

      {!isLoading &&
        processedListings &&
        processedListings.length === 0 &&
        listings &&
        listings.length > 0 &&
        marketplaceAddress &&
        !wrongChain &&
        listingFilter === "pit" && (
          <p className="text-sm text-muted-foreground">
            No {featuredLabel} listings right now. Create a listing for the collection at{" "}
            <span className="font-mono text-[10px]">{pitAddr}</span> or switch to All listings.
          </p>
        )}

      {!isLoading &&
        processedListings &&
        processedListings.length === 0 &&
        listings &&
        listings.length > 0 &&
        search.trim() && (
          <p className="text-sm text-muted-foreground">No listings match your search.</p>
        )}

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {!isLoading &&
          processedListings?.map((listing) => {
            const priceLabel = `${listing.currencyValuePerToken.displayValue} ${listing.currencyValuePerToken.symbol}`;
            const title = listing.asset.metadata?.name ?? `Listing #${String(listing.id)}`;
            const image =
              typeof listing.asset.metadata?.image === "string"
                ? listing.asset.metadata.image
                : undefined;
            const pit = isPitAsset(
              typeof listing.assetContractAddress === "string"
                ? listing.assetContractAddress
                : undefined,
            );
            const addr =
              typeof listing.assetContractAddress === "string" ? listing.assetContractAddress : "";
            return (
              <Link
                key={String(listing.id)}
                to="/marketplace/$listingId"
                params={{ listingId: String(listing.id) }}
                className="glass group overflow-hidden rounded-xl border border-white/10 transition hover:border-[rgb(212_175_55/0.35)] hover:shadow-[0_0_40px_-12px_rgb(212_175_55/0.2)]"
              >
                <div className="relative aspect-[4/3] bg-secondary">
                  {image ? (
                    <img
                      src={image}
                      alt=""
                      className="h-full w-full object-cover transition duration-300 group-hover:scale-[1.02]"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full items-center justify-center font-mono text-xs text-muted-foreground">
                      No image
                    </div>
                  )}
                  {pit && (
                    <div className="absolute left-2 top-2">
                      <Badge className="border-neon/40 bg-black/60 font-mono text-[10px] text-neon backdrop-blur-sm">
                        {featuredLabel}
                      </Badge>
                    </div>
                  )}
                </div>
                <div className="space-y-1.5 p-4">
                  <p className="font-heading font-semibold text-foreground line-clamp-2">{title}</p>
                  <p className="text-sm font-medium text-neon">{priceLabel}</p>
                  <p className="font-mono text-[10px] text-muted-foreground">
                    <span className="text-zinc-500">Collection </span>
                    {addr ? shortAddr(addr) : "—"}
                  </p>
                </div>
              </Link>
            );
          })}
      </div>
    </div>
  );
}
