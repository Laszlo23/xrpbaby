import { useMemo } from "react";
import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { useAccount } from "wagmi";
import { Copy, Loader2 } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { getMerchDrop } from "@/content/marketplace-merch";
import { MarketplaceMerchCheckout } from "@/components/marketplace/MarketplaceMerchCheckout";
import { formatLadderLine } from "@/lib/marketplace/merch-ladder";
import { Skeleton } from "@/components/ui/skeleton";
import { Button } from "@/components/ui/button";

type CatalogDrop = {
  slug: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
  editionCap: number;
  soldCount: number;
  status: string;
  unitsRemaining: number;
  quote: {
    unitNumber: number;
    priceUsd: number;
    nextPriceUsd: number | null;
    unitsRemaining: number;
    editionCap: number;
  } | null;
};

type OrderLookup = {
  ok: boolean;
  order?: {
    id: string;
    claimPath: string;
    unitNumber: number;
    editionCap: number;
    dropTitle: string;
    x402TxHash?: string | null;
  };
};

export const Route = createFileRoute("/marketplace/merch/$slug")({
  validateSearch: (search: Record<string, unknown>) => ({
    checkout: typeof search.checkout === "string" ? search.checkout : undefined,
    order: typeof search.order === "string" ? search.order : undefined,
  }),
  head: ({ params }) => {
    const drop = getMerchDrop(params.slug);
    return pageHead({
      title: drop ? `${drop.title} — Merch` : `Merch — ${BRAND_DISPLAY_NAME}`,
      description: drop?.description ?? "Culture merch drop",
      path: `/marketplace/merch/${params.slug}`,
    });
  },
  component: MarketplaceMerchDetailPage,
});

function MarketplaceMerchDetailPage() {
  const { slug } = Route.useParams();
  const { checkout, order: orderId } = Route.useSearch();
  const { address } = useAccount();
  const staticDrop = getMerchDrop(slug);
  if (!staticDrop) throw notFound();

  const { data, isLoading, isError } = useQuery({
    queryKey: ["merch-catalog", slug],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/merch/catalog");
      const json = (await res.json()) as { drops: CatalogDrop[] };
      return json.drops.find((d) => d.slug === slug) ?? null;
    },
  });

  const { data: paidOrder } = useQuery({
    queryKey: ["merch-order", orderId, address],
    queryFn: async () => {
      if (!orderId || !address) return null;
      const res = await fetch(
        `/api/marketplace/merch/order/${encodeURIComponent(orderId)}?wallet=${encodeURIComponent(address)}`,
      );
      return (await res.json()) as OrderLookup;
    },
    enabled: checkout === "success" && Boolean(orderId && address),
  });

  const drop = data ?? null;
  const soldOut = !drop || drop.unitsRemaining <= 0 || drop.status !== "open";

  const copyClaim = useMemo(() => {
    const path = paidOrder?.order?.claimPath;
    if (!path || typeof navigator === "undefined") return;
    return () => void navigator.clipboard.writeText(`${window.location.origin}${path}`);
  }, [paidOrder?.order?.claimPath]);

  return (
    <div className="space-y-8 pb-12">
      <Link to="/marketplace/merch" className="text-sm text-zinc-500 hover:text-zinc-300">
        ← All merch
      </Link>

      {checkout === "success" ? (
        <div className="rounded-2xl border border-emerald-500/30 bg-emerald-950/30 px-5 py-4 text-sm text-emerald-100">
          <p className="font-medium text-emerald-50">Payment received</p>
          {!address ? (
            <p className="mt-2">Connect your checkout wallet to reveal your claim link.</p>
          ) : paidOrder?.order ? (
            <div className="mt-2 space-y-2">
              <p>
                Unit #{paidOrder.order.unitNumber} of {paidOrder.order.editionCap} — save this for
                label claim after delivery:
              </p>
              <p className="font-mono text-xs break-all text-emerald-200">
                {paidOrder.order.claimPath}
              </p>
              {copyClaim ? (
                <Button
                  type="button"
                  size="sm"
                  variant="secondary"
                  className="rounded-full gap-2"
                  onClick={copyClaim}
                >
                  <Copy className="h-3.5 w-3.5" aria-hidden />
                  Copy claim link
                </Button>
              ) : null}
            </div>
          ) : orderId ? (
            <p className="mt-2 flex items-center gap-2 text-emerald-200/80">
              <Loader2 className="h-4 w-4 animate-spin" aria-hidden />
              Loading order…
            </p>
          ) : (
            <p className="mt-2">
              We&apos;ll email shipping updates. Scan your inside label when the tee arrives.
            </p>
          )}
        </div>
      ) : null}

      {checkout === "cancel" ? (
        <div className="rounded-2xl border border-amber-500/30 bg-amber-950/20 px-5 py-4 text-sm text-amber-100">
          Checkout cancelled — your reservation may expire in ~30 minutes. You can try again below.
        </div>
      ) : null}

      {isError ? (
        <p className="text-sm text-amber-200/90">
          Could not load live inventory. Refresh to try again.
        </p>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-zinc-950">
          {isLoading ? (
            <Skeleton className="aspect-square w-full rounded-none" />
          ) : (
            <img
              src={drop?.imageUrl ?? staticDrop.imageUrl}
              alt={staticDrop.title}
              className="aspect-square w-full object-contain p-8"
            />
          )}
        </div>

        <div className="space-y-6">
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
              {staticDrop.subtitle}
            </p>
            <h1 className="mt-2 font-heading text-2xl font-semibold text-white md:text-3xl">
              {staticDrop.title}
            </h1>
            <p className="mt-3 text-sm leading-relaxed text-zinc-400">{staticDrop.description}</p>
          </div>

          {isLoading ? (
            <Skeleton className="h-12 w-full rounded-xl" />
          ) : drop?.quote ? (
            <p className="rounded-xl border border-white/[0.06] bg-black/40 px-4 py-3 text-sm text-zinc-300">
              {formatLadderLine(drop.quote)}
            </p>
          ) : soldOut ? (
            <p className="text-sm text-amber-200/90">This edition is sold out or in production.</p>
          ) : null}

          {isLoading ? (
            <Skeleton className="h-64 w-full rounded-2xl" />
          ) : (
            <MarketplaceMerchCheckout
              drop={staticDrop}
              quote={drop?.quote ?? null}
              soldOut={soldOut}
            />
          )}
        </div>
      </div>
    </div>
  );
}
