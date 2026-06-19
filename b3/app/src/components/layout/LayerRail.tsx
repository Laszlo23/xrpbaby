import { Link, useLocation } from "@tanstack/react-router";
import { CULTURE_LAYERS, type CultureLayerId } from "@/lib/culture-layers";

type LayerRailProps = {
  /** Highlight layer by route prefix or explicit id */
  activeLayerId?: CultureLayerId;
  className?: string;
};

function layerFromPathname(pathname: string): CultureLayerId | undefined {
  if (
    pathname.startsWith("/forest") ||
    pathname.startsWith("/connect") ||
    pathname.startsWith("/chronicles") ||
    pathname.startsWith("/team")
  ) {
    return "community";
  }
  if (
    pathname.startsWith("/pass") ||
    pathname.startsWith("/profile") ||
    pathname.startsWith("/credentials") ||
    pathname.startsWith("/id/")
  ) {
    return "identity";
  }
  if (
    pathname.startsWith("/agent") ||
    pathname.startsWith("/agents") ||
    pathname.startsWith("/grant-proof") ||
    pathname.startsWith("/studio") ||
    pathname.startsWith("/elias")
  ) {
    return "agents";
  }
  if (
    pathname.startsWith("/marketplace") ||
    pathname.startsWith("/play") ||
    pathname.startsWith("/collections") ||
    pathname.startsWith("/creators")
  ) {
    return "economy";
  }
  if (
    pathname.startsWith("/bcc") ||
    pathname.startsWith("/roots") ||
    pathname.startsWith("/legacy") ||
    pathname.startsWith("/campaign")
  ) {
    return "capital";
  }
  return undefined;
}

export function LayerRail({ activeLayerId, className = "" }: LayerRailProps) {
  const { pathname } = useLocation();
  const active = activeLayerId ?? layerFromPathname(pathname);

  return (
    <div
      className={`flex gap-1 overflow-x-auto pb-1 scrollbar-none ${className}`}
      role="tablist"
      aria-label="Culture layers"
    >
      {CULTURE_LAYERS.map((layer) => {
        const isActive = active === layer.id;
        const hubHref =
          layer.id === "community"
            ? "/forest"
            : layer.id === "identity"
              ? "/profile"
              : layer.id === "agents"
                ? "/agents/inbox"
                : layer.id === "economy"
                  ? "/play"
                  : "/legacy";

        return (
          <Link
            key={layer.id}
            to={hubHref}
            role="tab"
            aria-selected={isActive}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.14em] transition ${
              isActive
                ? "border-white/25 bg-white/[0.08] text-white"
                : "border-white/5 text-zinc-500 hover:border-white/15 hover:text-zinc-300"
            }`}
            style={isActive ? { boxShadow: `0 0 20px -8px ${layer.color}` } : undefined}
          >
            <layer.icon
              className="h-3.5 w-3.5 shrink-0"
              style={{ color: isActive ? layer.color : undefined }}
              strokeWidth={2}
            />
            <span>{layer.label}</span>
          </Link>
        );
      })}
    </div>
  );
}
