import { Link, Outlet, createFileRoute } from "@tanstack/react-router";
import { Compass } from "lucide-react";

import { BRAND_DISPLAY_NAME } from "@/lib/brand";

export const Route = createFileRoute("/explorer")({
  component: ExplorerLayout,
});

function ExplorerLayout() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[rgb(8_8_10)] to-black pb-nav-safe">
      <div className="border-b border-white/[0.06] bg-black/40 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-5 md:px-8">
          <Link to="/explorer" className="flex items-center gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-[var(--base-blue)]/30 bg-black/50 text-[var(--base-blue)]">
              <Compass className="h-5 w-5" aria-hidden />
            </span>
            <span>
              <span className="block font-mono text-[10px] uppercase tracking-[0.22em] text-zinc-500">
                {BRAND_DISPLAY_NAME}
              </span>
              <span className="block font-heading text-lg font-semibold tracking-tight text-white">
                Explorer for humans
              </span>
            </span>
          </Link>
          <span className="hidden rounded-full border border-white/[0.1] bg-black/50 px-3.5 py-1.5 font-mono text-[10px] uppercase tracking-wider text-zinc-400 sm:inline-flex">
            Base mainnet
          </span>
        </div>
      </div>

      <div className="mx-auto max-w-5xl px-4 py-8 md:px-8 md:py-10">
        <Outlet />
      </div>
    </div>
  );
}
