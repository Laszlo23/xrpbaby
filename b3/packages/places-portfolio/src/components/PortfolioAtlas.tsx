import type { ComponentType } from "react";
import type { AtlasMarker, PortfolioLinkProps } from "../types.js";
import { resolveLink } from "./link.js";

type Props = {
  markers: readonly AtlasMarker[];
  detailHrefForId: (propertyId: number) => string;
  LinkComponent?: ComponentType<PortfolioLinkProps>;
};

export function PortfolioAtlas({ markers, detailHrefForId, LinkComponent }: Props) {
  const Link = resolveLink(LinkComponent);

  return (
    <section className="border-y border-[hsl(0_0%_100%/0.1)] bg-[#0a0a0a] px-8 py-32">
      <div className="mx-auto max-w-7xl">
        <div className="mb-16 flex flex-col justify-between gap-8 md:flex-row md:items-end">
          <div className="max-w-xl">
            <span className="pp-mono mb-4 block text-[10px] uppercase tracking-[0.3em] text-[hsl(38_25%_48%)]">
              The atlas
            </span>
            <h2 className="pp-display text-4xl italic tracking-tight md:text-5xl">
              Austria, on-chain.
            </h2>
            <p className="mt-4 text-pretty text-[hsl(30_10%_92%/0.5)]">
              Vienna heritage, Carinthian lakeside, and Weinviertel adaptive reuse — four anchors
              in the Building Culture RWA portfolio on Base.
            </p>
          </div>
          <div className="pp-mono space-y-1 text-right text-[10px] uppercase tracking-[0.3em] text-[hsl(30_10%_92%/0.5)]">
            <p>
              <span className="text-[hsl(38_25%_48%)]">●</span> featured asset
            </p>
            <p>
              <span className="text-[hsl(30_15%_92%/0.3)]">●</span> full catalog on Places
            </p>
          </div>
        </div>

        <div className="relative overflow-hidden border border-[hsl(0_0%_100%/0.1)] bg-[#070707]">
          <div
            className="relative aspect-[16/9] w-full bg-gradient-to-br from-[#0a1628] via-[#0d0d0d] to-[#1a1208]"
            aria-hidden
          />
          {markers.map((m) => (
            <Link
              key={m.propertyId}
              href={detailHrefForId(m.propertyId)}
              className="absolute"
              style={{ top: m.top, left: m.left }}
            >
              <div className="relative">
                <div className="size-2 rounded-full bg-[hsl(38_25%_48%)] shadow-[0_0_20px_rgba(170,140,90,0.8)]" />
                <div className="pp-pulse absolute inset-0 size-2 rounded-full bg-[hsl(38_25%_48%)]" />
                <span className="pp-mono absolute left-4 top-1/2 max-w-[min(140px,38vw)] -translate-y-1/2 truncate text-[9px] uppercase tracking-widest text-[hsl(38_25%_48%)] sm:max-w-none sm:whitespace-nowrap sm:text-[10px]">
                  {m.label}
                </span>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
