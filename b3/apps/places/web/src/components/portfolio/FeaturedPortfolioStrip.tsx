"use client";

import type { ComponentType } from "react";
import {
  PortfolioImage,
  type PortfolioCardProps,
  type PortfolioLinkProps,
} from "@bc/places-portfolio";

import { NextPortfolioLink } from "@/components/portfolio/NextPortfolioLink";

type Props = {
  cards: PortfolioCardProps[];
  title?: string;
  LinkComponent?: ComponentType<PortfolioLinkProps>;
};

export function FeaturedPortfolioStrip({
  cards,
  title = "Featured",
  LinkComponent = NextPortfolioLink,
}: Props) {
  const Link = LinkComponent;

  return (
    <section className="places-portfolio space-y-4">
      <h2 className="pp-display text-xl italic text-[hsl(30_15%_92%)] sm:text-2xl">{title}</h2>
      <div className="flex gap-px overflow-x-auto border border-[hsl(0_0%_100%/0.1)] bg-[hsl(0_0%_100%/0.1)] pb-px">
        {cards.map((p) => (
          <article
            key={p.propertyId}
            className="group min-w-[280px] max-w-[320px] shrink-0 cursor-pointer bg-[hsl(0_0%_5%)] p-5 transition-colors hover:bg-[#0d0d0d] sm:min-w-[300px]"
          >
            <Link href={p.detailHref} className="block">
              <div className="mb-3 flex items-start justify-between gap-2">
                <span
                  className={`pp-mono border px-2 py-0.5 text-[9px] uppercase tracking-widest ${
                    p.badgeAccent
                      ? "border-[hsl(38_25%_48%/0.4)] text-[hsl(38_25%_48%)]"
                      : "border-[hsl(0_0%_100%/0.1)] text-[hsl(30_10%_92%/0.5)]"
                  }`}
                >
                  {p.badge}
                </span>
                <span className="pp-mono text-sm text-[hsl(38_25%_48%)]">{p.yieldLabel}</span>
              </div>
              <div className="mb-4 aspect-[4/3] overflow-hidden">
                <PortfolioImage
                  src={p.heroImageUrl}
                  alt={p.headline}
                  className="h-full w-full object-cover grayscale transition-all duration-700 group-hover:grayscale-0"
                />
              </div>
              <h3 className="pp-display mb-1 text-lg italic leading-tight">{p.headline}</h3>
              <p className="text-xs text-[hsl(30_10%_92%/0.5)]">
                {p.location} · {p.symbol}
              </p>
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
