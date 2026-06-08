"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { getPropertyGeoById } from "@/lib/property-geo";
import type { DemoPropertyDetail } from "@/lib/demo-properties";

type MapProperty = {
  id: string;
  name: string;
  demo?: DemoPropertyDetail;
};

type Props = {
  properties: MapProperty[];
};

function latLngToPercent(lat: number, lng: number): { top: string; left: string } {
  const minLat = 35;
  const maxLat = 55;
  const minLng = -10;
  const maxLng = 25;
  const top = ((maxLat - lat) / (maxLat - minLat)) * 100;
  const left = ((lng - minLng) / (maxLng - minLng)) * 100;
  return {
    top: `${Math.min(95, Math.max(5, top))}%`,
    left: `${Math.min(95, Math.max(5, left))}%`,
  };
}

export function PropertyMapBrowse({ properties }: Props) {
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const pins = useMemo(() => {
    return properties
      .map((p) => {
        const geo = getPropertyGeoById(Number(p.id));
        if (!geo) return null;
        const pos = latLngToPercent(geo.lat, geo.lng);
        return { ...p, geo, pos };
      })
      .filter(Boolean) as (MapProperty & {
      geo: { lat: number; lng: number; label: string };
      pos: { top: string; left: string };
    })[];
  }, [properties]);

  const selected = pins.find((p) => p.id === selectedId);

  return (
    <div className="grid gap-6 lg:grid-cols-[1.2fr_1fr]">
      <div className="relative aspect-[4/3] overflow-hidden rounded-2xl border border-white/10 bg-zinc-950">
        <div
          className="absolute inset-0 opacity-40"
          style={{
            backgroundImage:
              "linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)",
            backgroundSize: "32px 32px",
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-b from-bc-cyan/5 via-transparent to-bc-lime/5" />
        {pins.map((pin) => (
          <button
            key={pin.id}
            type="button"
            onClick={() => setSelectedId(pin.id)}
            className={`absolute z-10 -translate-x-1/2 -translate-y-full transition ${
              selectedId === pin.id ? "scale-125" : "hover:scale-110"
            }`}
            style={{ top: pin.pos.top, left: pin.pos.left }}
            title={pin.name}
          >
            <span
              className={`flex h-8 w-8 items-center justify-center rounded-full border-2 shadow-lg ${
                selectedId === pin.id
                  ? "border-bc-lime bg-bc-lime text-black"
                  : "border-bc-cyan bg-bc-cyan/20 text-bc-cyan"
              }`}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" fill="currentColor" aria-hidden>
                <path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z" />
              </svg>
            </span>
          </button>
        ))}
        <p className="absolute bottom-3 left-3 text-[10px] text-zinc-500">Approximate positions · OpenStreetMap data on detail pages</p>
      </div>

      <div className="max-h-[480px] space-y-3 overflow-y-auto pr-1">
        {selected ? (
          <div className="bc-glass-strong mb-4 rounded-2xl p-4">
            <p className="mono-label !text-bc-cyan">Selected</p>
            <h3 className="mt-2 font-display text-lg font-semibold text-white">
              {selected.demo?.headline ?? selected.name}
            </h3>
            <p className="mt-1 text-sm text-zinc-500">{selected.geo.label}</p>
            <Link
              href={`/marketplace/${selected.id}`}
              className="mt-3 inline-block text-sm font-medium text-bc-lime hover:underline"
            >
              View property →
            </Link>
          </div>
        ) : null}
        {properties.map((p) => (
          <Link
            key={p.id}
            href={`/marketplace/${p.id}`}
            onMouseEnter={() => setSelectedId(p.id)}
            className={`block rounded-xl border p-4 transition ${
              selectedId === p.id
                ? "border-bc-cyan/40 bg-bc-cyan/5"
                : "border-white/8 bg-white/[0.02] hover:border-white/15"
            }`}
          >
            <p className="font-medium text-white">{p.demo?.headline ?? p.name}</p>
            <p className="mt-1 text-xs text-zinc-500">
              {p.demo?.location ?? `Property #${p.id}`}
            </p>
          </Link>
        ))}
      </div>
    </div>
  );
}
