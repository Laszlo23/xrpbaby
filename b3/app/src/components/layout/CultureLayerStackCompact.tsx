import { useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence } from "@/components/landing/motion";

import { LandingCultureLayer } from "@/components/landing/LandingCultureLayer";
import {
  DEFAULT_CULTURE_LAYER_ID,
  getCultureLayer,
  CULTURE_LAYERS_STACK_DISPLAY,
  type CultureLayerId,
  type CultureLayerSubItem,
} from "@/lib/culture-layers";

function SubItemLink({ item }: { item: CultureLayerSubItem }) {
  const className =
    "block rounded-lg border border-white/5 px-3 py-2 text-sm text-zinc-300 hover:border-white/15";
  if (item.href.startsWith("#") || item.href.startsWith("http")) {
    return (
      <a href={item.href} className={className}>
        {item.label}
      </a>
    );
  }
  return (
    <Link to={item.href} className={className}>
      {item.label}
    </Link>
  );
}

/** Compact culture layer stack for logged-in hub pages. */
export function CultureLayerStackCompact() {
  const [selectedId, setSelectedId] = useState<CultureLayerId>(DEFAULT_CULTURE_LAYER_ID);
  const selectedLayer = getCultureLayer(selectedId);

  return (
    <section className="rounded-2xl border border-white/10 bg-zinc-950/40 p-4 sm:p-6">
      <p className="mb-4 font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
        Five layers of culture
      </p>
      <div className="flex flex-wrap gap-2">
        {CULTURE_LAYERS_STACK_DISPLAY.map((layer) => (
          <button
            key={layer.id}
            type="button"
            onClick={() => setSelectedId(layer.id)}
            className={`rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-wider transition ${
              selectedId === layer.id
                ? "border-white/25 bg-white/[0.08] text-white"
                : "border-white/5 text-zinc-500 hover:text-zinc-300"
            }`}
          >
            {layer.label}
          </button>
        ))}
      </div>
      <AnimatePresence mode="wait">
        <div key={selectedLayer.id} className="mt-4">
          <p className="text-sm text-zinc-400">{selectedLayer.headline}</p>
          <ul className="mt-3 grid gap-2 sm:grid-cols-2">
            {selectedLayer.subItems.map((item) => (
              <li key={item.id}>
                <SubItemLink item={item} />
              </li>
            ))}
          </ul>
        </div>
      </AnimatePresence>
    </section>
  );
}

/** Full landing section — re-export for ecosystem page. */
export { LandingCultureLayer };
