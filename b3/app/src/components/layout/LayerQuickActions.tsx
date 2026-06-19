import { Link } from "@tanstack/react-router";
import { ArrowRight } from "lucide-react";

import { CULTURE_LAYERS, type CultureLayerId } from "@/lib/culture-layers";

type LayerQuickActionsProps = {
  layerId: CultureLayerId;
  maxItems?: number;
};

export function LayerQuickActions({ layerId, maxItems = 3 }: LayerQuickActionsProps) {
  const layer = CULTURE_LAYERS.find((l) => l.id === layerId);
  if (!layer) return null;

  const items = layer.subItems.slice(0, maxItems);

  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.02] p-4">
      <div className="mb-3 flex items-center gap-2">
        <layer.icon className="h-4 w-4" style={{ color: layer.color }} strokeWidth={2} />
        <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-500">
          Layer {layer.number} · {layer.label}
        </p>
      </div>
      <ul className="space-y-2">
        {items.map((item) => {
          const className =
            "group flex items-center justify-between rounded-xl border border-white/5 bg-black/20 px-3 py-2.5 text-left transition hover:border-white/15 hover:bg-white/[0.04]";
          const inner = (
            <>
              <div>
                <p className="text-sm font-medium text-white">{item.label}</p>
                <p className="mt-0.5 line-clamp-1 text-xs text-zinc-500">{item.description}</p>
              </div>
              <ArrowRight className="h-4 w-4 shrink-0 text-zinc-600 transition group-hover:translate-x-0.5 group-hover:text-white" />
            </>
          );
          if (item.href.startsWith("#") || item.href.startsWith("http")) {
            return (
              <li key={item.id}>
                <a href={item.href} className={className}>
                  {inner}
                </a>
              </li>
            );
          }
          return (
            <li key={item.id}>
              <Link to={item.href} className={className}>
                {inner}
              </Link>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
