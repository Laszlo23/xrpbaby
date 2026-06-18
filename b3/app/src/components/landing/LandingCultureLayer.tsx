import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "@/components/landing/motion";
import { ArrowRight } from "lucide-react";
import { useCallback, useState, type KeyboardEvent } from "react";

import { LandingIdentityGraph } from "@/components/landing/LandingIdentityGraph";
import {
  CULTURE_LAYERS_STACK_DISPLAY,
  DEFAULT_CULTURE_LAYER_ID,
  getCultureLayer,
  type CultureLayer,
  type CultureLayerId,
  type CultureLayerSubItem,
} from "@/lib/culture-layers";

function CultureLayerSubItemLink({ item }: { item: CultureLayerSubItem }) {
  const className =
    "group flex flex-col rounded-xl border border-white/10 bg-white/[0.03] p-4 text-left transition hover:border-white/20 hover:bg-white/[0.06]";

  const content = (
    <>
      <span className="font-display text-sm font-bold text-white">{item.label}</span>
      <span className="mt-1.5 text-xs leading-relaxed text-zinc-400">{item.description}</span>
      <span className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-zinc-500 transition group-hover:text-white">
        Explore
        <ArrowRight size={12} className="transition group-hover:translate-x-0.5" />
      </span>
    </>
  );

  if (item.href.startsWith("#") || item.href.startsWith("http")) {
    return (
      <a href={item.href} className={className} data-testid={`culture-subitem-${item.id}`}>
        {content}
      </a>
    );
  }

  return (
    <Link to={item.href} className={className} data-testid={`culture-subitem-${item.id}`}>
      {content}
    </Link>
  );
}

function LayerDetailPanel({ layer }: { layer: CultureLayer }) {
  return (
    <motion.div
      key={layer.id}
      initial={{ opacity: 0, x: 12 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -12 }}
      transition={{ duration: 0.25 }}
      role="tabpanel"
      id={`culture-panel-${layer.id}`}
      aria-labelledby={`culture-tab-${layer.id}`}
      data-testid={`culture-panel-${layer.id}`}
      className="rounded-2xl border border-white/10 bg-white/[0.03] p-6 sm:p-8"
    >
      <div className="flex items-start gap-4">
        <div
          className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border"
          style={{
            borderColor: `${layer.color}40`,
            boxShadow: `0 0 30px -10px ${layer.color}`,
          }}
        >
          <layer.icon size={22} style={{ color: layer.color }} />
        </div>
        <div>
          <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-500">
            LAYER 0{layer.number}
          </p>
          <h3 className="mt-1 font-display text-2xl font-bold text-white sm:text-3xl">
            {layer.label}
          </h3>
          <p className="mt-2 text-sm text-zinc-400 sm:text-base">{layer.headline}</p>
        </div>
      </div>

      {layer.id === "identity" && (
        <p className="mt-4 rounded-lg border border-[#C5FF41]/20 bg-[#C5FF41]/5 px-4 py-2.5 text-xs text-zinc-400">
          See the live identity graph below — one wallet, many identities unified in the Culture
          Layer.
        </p>
      )}

      <div className="mt-6 grid grid-cols-1 gap-3 sm:grid-cols-2">
        {layer.subItems.map((item) => (
          <CultureLayerSubItemLink key={item.id} item={item} />
        ))}
      </div>
    </motion.div>
  );
}

export function LandingCultureLayer() {
  const [selectedId, setSelectedId] = useState<CultureLayerId>(DEFAULT_CULTURE_LAYER_ID);
  const selectedLayer = getCultureLayer(selectedId);

  const selectByIndex = useCallback((index: number) => {
    const layer = CULTURE_LAYERS_STACK_DISPLAY[index];
    if (layer) setSelectedId(layer.id);
  }, []);

  const handleKeyDown = useCallback(
    (event: KeyboardEvent, index: number) => {
      if (event.key === "ArrowUp" && index > 0) {
        event.preventDefault();
        selectByIndex(index - 1);
      } else if (event.key === "ArrowDown" && index < CULTURE_LAYERS_STACK_DISPLAY.length - 1) {
        event.preventDefault();
        selectByIndex(index + 1);
      }
    },
    [selectByIndex],
  );

  return (
    <section id="culture" className="relative w-full overflow-hidden bg-[#050505] py-28 sm:py-36">
      <div className="absolute inset-0 bc-grid opacity-50" />

      <div className="relative mx-auto max-w-7xl px-5 sm:px-8">
        <div className="mx-auto max-w-3xl text-center">
          <p className="mono-label">THE CULTURE LAYER</p>
          <motion.h2
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="mt-4 font-display text-[40px] leading-[1] font-bold tracking-tight text-white sm:text-7xl"
          >
            Everything <span className="bc-text-cyan-gradient">connects.</span>
          </motion.h2>
          <p className="mt-6 text-base text-zinc-400 sm:text-lg">
            Five layers, one flow — from people and places to identity, agents, economy, and
            capital.
          </p>
        </div>

        <div className="mt-16 grid grid-cols-1 gap-8 lg:grid-cols-[minmax(0,280px)_1fr] lg:gap-10">
          <div
            role="tablist"
            aria-label="Culture layers"
            className="flex flex-col gap-2"
            data-testid="culture-layer-list"
          >
            {CULTURE_LAYERS_STACK_DISPLAY.map((layer, index) => {
              const isSelected = layer.id === selectedId;
              return (
                <button
                  key={layer.id}
                  type="button"
                  role="tab"
                  id={`culture-tab-${layer.id}`}
                  aria-selected={isSelected}
                  aria-controls={`culture-panel-${layer.id}`}
                  data-testid={`culture-layer-${layer.id}`}
                  onClick={() => setSelectedId(layer.id)}
                  onKeyDown={(e) => handleKeyDown(e, index)}
                  className={`group flex items-center gap-3 rounded-xl border px-4 py-3 text-left transition ${
                    isSelected
                      ? "border-white/20 bg-white/[0.08]"
                      : "border-white/5 bg-white/[0.02] hover:border-white/15 hover:bg-white/[0.05]"
                  }`}
                  style={isSelected ? { boxShadow: `inset 3px 0 0 ${layer.color}` } : undefined}
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border"
                    style={{ borderColor: `${layer.color}30` }}
                  >
                    <layer.icon size={18} style={{ color: layer.color }} />
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="font-mono text-[10px] font-bold tracking-widest text-zinc-500">
                      0{layer.number}
                    </p>
                    <p className="font-display text-sm font-bold text-white">{layer.label}</p>
                  </div>
                </button>
              );
            })}
          </div>

          <AnimatePresence mode="wait">
            <LayerDetailPanel layer={selectedLayer} />
          </AnimatePresence>
        </div>

        <LandingIdentityGraph />
      </div>
    </section>
  );
}
