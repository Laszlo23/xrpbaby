"use client";

import Link from "next/link";
import { PropertyMapBrowse } from "@/components/rwa/PropertyMapBrowse";
import { MarketplaceHero } from "@/components/rwa/MarketplaceHero";
import { usePropertyShareList } from "@/lib/usePropertyShareList";
import { track } from "@/lib/analytics";
import { useEffect } from "react";

export default function MarketplaceMapPage() {
  const { rows, loading } = usePropertyShareList();

  useEffect(() => {
    track("rwa_marketplace_view", { path: "/marketplace/map" });
  }, []);

  const mapProps = rows.map((r) => ({
    id: r.id.toString(),
    name: r.name,
    demo: r.demo,
  }));

  return (
    <div className="mx-auto max-w-[1280px] space-y-8 pb-16">
      <div className="flex items-center justify-between gap-4">
        <Link href="/marketplace" className="text-sm text-zinc-500 hover:text-bc-cyan">
          ← Grid view
        </Link>
      </div>
      <MarketplaceHero />
      {loading ? (
        <p className="animate-pulse text-zinc-500">Loading map…</p>
      ) : (
        <PropertyMapBrowse properties={mapProps} />
      )}
    </div>
  );
}
