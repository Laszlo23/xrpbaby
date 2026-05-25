import { createFileRoute, Link } from "@tanstack/react-router";
import { pageHead } from "@/lib/seo";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useChainId, useAccount } from "wagmi";
import { ArrowLeft, Loader2 } from "lucide-react";
import { sendTransaction } from "thirdweb";
import { getContract } from "thirdweb";
import { buyFromListing, getListing } from "thirdweb/extensions/marketplace";
import { useActiveAccount } from "thirdweb/react";
import { toast } from "sonner";
import { thirdwebClient } from "@/lib/thirdweb-client";
import { thirdwebChainFromId } from "@/lib/thirdweb-chain";
import { getMarketplaceContractAddress } from "@/lib/marketplace-config";
import { getMarketplaceChain } from "@/lib/chains";
import { explorerAddressUrl } from "@/lib/explorer";
import { assertMarketplaceBytecode, mapMarketplaceRpcError } from "@/lib/marketplace-read-guard";
import { Button } from "@/components/ui/button";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/marketplace/$listingId")({
  head: ({ params }) =>
    pageHead({
      title: `Listing #${params.listingId} — ${BRAND_DISPLAY_NAME}`,
      description: `Buy or view ${BRAND_DISPLAY_NAME} marketplace listing #${params.listingId} on Base — ERC-721 secondary sale.`,
      path: `/marketplace/${params.listingId}`,
      keywords: ["Build Culture", "marketplace", "listing", params.listingId],
    }),
  component: MarketplaceListingPage,
});

function shortAddr(a: string): string {
  if (a.length < 14) return a;
  return `${a.slice(0, 8)}…${a.slice(-6)}`;
}

function MarketplaceListingPage() {
  const { listingId } = Route.useParams();
  const chainId = useChainId();
  const { isConnected } = useAccount();
  const marketplaceChain = getMarketplaceChain();
  const marketplaceAddress = getMarketplaceContractAddress();
  const twAccount = useActiveAccount();

  const idBig = (() => {
    try {
      return BigInt(listingId);
    } catch {
      return undefined;
    }
  })();

  const {
    data: listing,
    isLoading,
    error,
  } = useQuery({
    queryKey: ["marketplace-listing", marketplaceChain.id, marketplaceAddress, listingId],
    queryFn: async () => {
      if (!thirdwebClient || !marketplaceAddress || idBig === undefined) return undefined;
      const contract = getContract({
        client: thirdwebClient,
        chain: thirdwebChainFromId(marketplaceChain.id),
        address: marketplaceAddress,
      });
      try {
        await assertMarketplaceBytecode(contract, marketplaceChain.name);
        return await getListing({ contract, listingId: idBig });
      } catch (e) {
        throw mapMarketplaceRpcError(e);
      }
    },
    enabled:
      !!thirdwebClient &&
      !!marketplaceAddress &&
      idBig !== undefined &&
      chainId === marketplaceChain.id,
  });

  const buyMutation = useMutation({
    mutationFn: async () => {
      if (!thirdwebClient || !marketplaceAddress || !listing || !twAccount?.address) {
        toast.error("Connect a wallet and open a valid listing to buy.");
        return;
      }
      const contract = getContract({
        client: thirdwebClient,
        chain: thirdwebChainFromId(marketplaceChain.id),
        address: marketplaceAddress,
      });
      const tx = buyFromListing({
        contract,
        listingId: listing.id,
        quantity: 1n,
        recipient: twAccount.address,
      });
      await sendTransaction({ transaction: tx, account: twAccount });
    },
    onSuccess: () => {
      toast.success("Purchase submitted");
    },
    onError: (e) => {
      toast.error(mapMarketplaceRpcError(e).message);
    },
  });

  const wrongChain = chainId !== marketplaceChain.id;
  const priceLabel = listing
    ? `${listing.currencyValuePerToken.displayValue} ${listing.currencyValuePerToken.symbol}`
    : "";

  const assetAddr =
    listing && typeof listing.assetContractAddress === "string" ? listing.assetContractAddress : "";

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <Link
        to="/marketplace"
        className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
      >
        <ArrowLeft className="h-4 w-4" />
        All listings
      </Link>

      {idBig === undefined && <p className="text-sm text-destructive">Invalid listing id.</p>}

      {wrongChain && (
        <p className="rounded-lg border border-destructive/40 bg-destructive/10 px-4 py-3 text-sm">
          Switch to <span className="font-semibold">{marketplaceChain.name}</span> using your wallet
          to view and buy this listing.
        </p>
      )}

      {isLoading && (
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="h-4 w-4 animate-spin" />
          Loading…
        </div>
      )}

      {error && (
        <p className="text-sm text-destructive">
          {error instanceof Error ? error.message : "Failed to load listing"}
        </p>
      )}

      {listing && (
        <div className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,380px)] lg:items-start">
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-secondary shadow-[0_0_60px_-24px_rgb(212_175_55/0.15)]">
              {typeof listing.asset.metadata?.image === "string" ? (
                <img
                  src={listing.asset.metadata.image}
                  alt=""
                  className="aspect-square w-full object-cover lg:min-h-[320px] lg:aspect-auto lg:max-h-[min(72vh,560px)]"
                />
              ) : (
                <div className="flex aspect-square min-h-[240px] items-center justify-center text-muted-foreground text-sm lg:aspect-auto">
                  No image
                </div>
              )}
            </div>
            <div className="space-y-5">
              <div>
                <h1 className="font-heading text-2xl font-bold tracking-tight text-foreground md:text-3xl">
                  {listing.asset.metadata?.name ?? `Listing #${String(listing.id)}`}
                </h1>
                {listing.asset.metadata?.description ? (
                  <p className="mt-3 text-sm leading-relaxed text-muted-foreground whitespace-pre-wrap">
                    {String(listing.asset.metadata.description)}
                  </p>
                ) : null}
              </div>

              <div className="rounded-xl border border-white/[0.08] bg-black/30 p-4">
                <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
                  Price
                </p>
                <p className="mt-1 text-2xl font-semibold text-neon">{priceLabel}</p>
                <p className="mt-3 text-[11px] leading-relaxed text-muted-foreground">
                  The marketplace contract may apply fees on settlement; you authorize the full
                  listing price plus gas when you buy.
                </p>
              </div>

              <div className="space-y-2 font-mono text-[11px] text-muted-foreground">
                <p>
                  <span className="text-zinc-500">Asset contract </span>
                  <a
                    href={explorerAddressUrl(marketplaceChain.id, listing.assetContractAddress)}
                    target="_blank"
                    rel="noreferrer"
                    className="text-neon underline break-all"
                  >
                    {assetAddr ? shortAddr(assetAddr) : listing.assetContractAddress}
                  </a>
                </p>
                <p>
                  <span className="text-zinc-500">Token ID </span>
                  <span className="text-zinc-300">{String(listing.tokenId)}</span>
                </p>
                <p>
                  <span className="text-zinc-500">Listing </span>
                  <span className="text-zinc-300">#{String(listing.id)}</span>
                  {listing.status !== "ACTIVE" ? (
                    <span className="ml-2 text-amber-200/90">({listing.status})</span>
                  ) : null}
                </p>
              </div>

              <Button
                type="button"
                size="lg"
                className="w-full rounded-full text-base sm:w-auto sm:min-w-[200px]"
                disabled={
                  !isConnected ||
                  !twAccount ||
                  buyMutation.isPending ||
                  wrongChain ||
                  listing.status !== "ACTIVE"
                }
                onClick={() => buyMutation.mutate()}
              >
                {buyMutation.isPending ? "Confirm in wallet…" : "Buy now"}
              </Button>
              {isConnected && !twAccount && (
                <p className="text-xs text-amber-200/90">
                  Thirdweb wallet session not ready — open the wallet menu and reconnect, then try
                  again.
                </p>
              )}
              {!isConnected && (
                <p className="text-xs text-muted-foreground">
                  Connect your wallet in the header to purchase this NFT.
                </p>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
