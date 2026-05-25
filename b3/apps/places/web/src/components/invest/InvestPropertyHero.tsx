"use client";

import Image from "next/image";
import type { DemoPropertyDetail } from "@/lib/demo-properties";
import { getPropertyDedicatedHeroPath } from "@/lib/property-public-images";

type Props = {
  propertyId: bigint;
  demo: DemoPropertyDetail;
};

export function InvestPropertyHero({ propertyId, demo }: Props) {
  const heroSrc = getPropertyDedicatedHeroPath(propertyId);
  const title = demo.investorCardTitle ?? demo.headline;
  const subtitle = demo.investorCardSubtitle ?? demo.location;

  return (
    <div className="relative overflow-hidden rounded-3xl border border-white/[0.08] bg-zinc-900">
      <div className="relative aspect-[21/9] min-h-[200px] w-full sm:min-h-[260px]">
        <Image
          src={heroSrc}
          alt={demo.imageAlt ?? title}
          fill
          className="object-cover object-center"
          sizes="100vw"
          priority
        />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/95 via-black/35 to-transparent" />
        <div className="absolute inset-x-0 bottom-0 z-10 p-6 sm:p-10">
          <p className="text-[11px] font-medium uppercase tracking-[0.2em] text-gold-400/90">Selected property</p>
          <h2 className="mt-2 text-2xl font-semibold tracking-tight text-white sm:text-3xl">{title}</h2>
          <p className="mt-2 text-sm text-zinc-300">{subtitle}</p>
        </div>
      </div>
    </div>
  );
}
