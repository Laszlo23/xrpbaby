import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { Shirt } from "lucide-react";

import { pageHead } from "@/lib/seo";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { formatMerchUsd } from "@/lib/marketplace/merch-ladder";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";

type CatalogDrop = {
  slug: string;
  title: string;
  subtitle: string;
  imageUrl: string;
  description: string;
  editionCap: number;
  soldCount: number;
  status: string;
  fromPriceUsd: number;
  unitsRemaining: number;
};

export const Route = createFileRoute("/marketplace/merch/")({
  head: () =>
    pageHead({
      title: `Culture Merch — ${BRAND_DISPLAY_NAME}`,
      description:
        "Four limited-edition Building Culture tees — ladder pricing, 77 units per design, physical shirt plus QR credential.",
      path: "/marketplace/merch",
      keywords: ["merch", "t-shirt", "Building Culture", "credential", "limited edition"],
    }),
  component: MarketplaceMerchHubPage,
});

function MarketplaceMerchHubPage() {
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ["merch-catalog"],
    queryFn: async () => {
      const res = await fetch("/api/marketplace/merch/catalog");
      return (await res.json()) as { ok: boolean; drops: CatalogDrop[] };
    },
  });

  const drops = data?.drops ?? [];

  return (
    <div className="space-y-10 pb-12">
      <header className="space-y-4">
        <p className="font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
          Limited edition · Physical + digital
        </p>
        <div className="flex items-start gap-3">
          <Shirt className="mt-1 h-8 w-8 shrink-0 text-[var(--vault-gold)]" aria-hidden />
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white md:text-3xl">
              Culture merch drop
            </h2>
            <p className="mt-2 max-w-2xl text-sm leading-relaxed text-zinc-400">
              Four tees, 77 units each. Ladder pricing — earliest buyers pay least. Pay with card or
              USDC on Base. Scan the inside label to claim your limited-merch credential.
            </p>
          </div>
        </div>
      </header>

      {isError ? (
        <div className="rounded-xl border border-amber-500/30 bg-amber-950/20 px-4 py-3 text-sm text-amber-100">
          Could not load merch catalog.{" "}
          <button type="button" className="underline" onClick={() => void refetch()}>
            Retry
          </button>
        </div>
      ) : null}

      {isLoading ? (
        <div className="grid gap-6 sm:grid-cols-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <Skeleton key={i} className="aspect-[4/5] rounded-2xl" />
          ))}
        </div>
      ) : (
        <div className="grid gap-6 sm:grid-cols-2">
          {drops.map((drop) => {
            const soldOut = drop.unitsRemaining <= 0 || drop.status !== "open";
            const card = (
              <>
                <div className="aspect-square overflow-hidden bg-zinc-900">
                  <img
                    src={drop.imageUrl}
                    alt={drop.title}
                    className={`h-full w-full object-contain p-6 transition ${soldOut ? "opacity-60 grayscale" : "group-hover:scale-[1.02]"}`}
                    loading="lazy"
                  />
                </div>
                <div className="space-y-2 p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {soldOut ? (
                      <Badge className="bg-zinc-700 text-zinc-200">Sold out</Badge>
                    ) : (
                      <Badge variant="outline" className="border-white/15 text-zinc-400">
                        {drop.unitsRemaining} left
                      </Badge>
                    )}
                    {drop.status !== "open" ? (
                      <Badge className="bg-amber-500/20 text-amber-200">{drop.status}</Badge>
                    ) : null}
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-white group-hover:text-[var(--vault-gold)]">
                    {drop.title}
                  </h3>
                  <p className="text-xs text-zinc-500">{drop.subtitle}</p>
                  <p className="text-sm text-zinc-400">
                    {soldOut
                      ? `${drop.soldCount} paid · edition closed`
                      : `From ${formatMerchUsd(drop.fromPriceUsd)} · ${drop.soldCount} paid`}
                  </p>
                </div>
              </>
            );

            if (soldOut) {
              return (
                <div
                  key={drop.slug}
                  className="overflow-hidden rounded-2xl border border-white/[0.08] bg-black/40 opacity-90"
                >
                  {card}
                </div>
              );
            }

            return (
              <Link
                key={drop.slug}
                to="/marketplace/merch/$slug"
                params={{ slug: drop.slug }}
                className="group overflow-hidden rounded-2xl border border-white/[0.08] bg-black/50 transition hover:border-[rgb(212_175_55/0.35)]"
              >
                {card}
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
}
