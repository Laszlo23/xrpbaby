import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { Sparkles, X } from "lucide-react";
import { useBcdEconomy } from "@/contexts/BcdEconomyContext";
import { BCD_SYMBOL } from "@/lib/bcd-config";

const DISMISS_KEY = "buildchain_bcd_banner_v1";

export function BcdEconomyBanner() {
  const { openGetBcd } = useBcdEconomy();
  const [hidden, setHidden] = useState(true);

  useEffect(() => {
    try {
      setHidden(localStorage.getItem(DISMISS_KEY) === "1");
    } catch {
      setHidden(false);
    }
  }, []);

  function dismiss() {
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
    setHidden(true);
  }

  if (hidden) return null;

  return (
    <div className="relative border-b border-white/[0.07] bg-gradient-to-r from-[rgb(0_40_100/0.38)] via-black/80 to-[rgb(60_20_40/0.35)] px-4 py-3 md:px-8">
      <div className="pointer-events-none absolute inset-0 opacity-[0.06] [background-image:linear-gradient(rgba(255,255,255,0.06)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.06)_1px,transparent_1px)] [background-size:40px_40px]" />
      <div className="relative mx-auto flex max-w-6xl flex-col items-start gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex items-start gap-3 sm:items-center">
          <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/[0.06]">
            <Sparkles className="h-4 w-4 text-amber-300" aria-hidden />
          </span>
          <div>
            <p className="font-mono text-[10px] uppercase tracking-[0.28em] text-zinc-500">
              Economy
            </p>
            <p className="mt-0.5 max-w-2xl text-sm leading-snug text-zinc-200 md:text-[15px]">
              Earn XP · Stack <span className="text-amber-200/95">{BCD_SYMBOL}</span> · Mint
              drops—your loop for real stays & art.
            </p>
          </div>
        </div>
        <div className="flex w-full shrink-0 flex-wrap items-center gap-2 sm:w-auto sm:justify-end">
          <button
            type="button"
            onClick={openGetBcd}
            className="rounded-full bg-[var(--b3-purple)] px-5 py-2 text-xs font-medium text-white shadow-[0_0_28px_-8px_rgb(0_82_255/70%)] transition hover:bg-[var(--base-blue-hover)] active:scale-[0.98]"
          >
            Get {BCD_SYMBOL}
          </button>
          <Link
            to="/play"
            hash="drops"
            className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            See live drops
          </Link>
          <Link
            to="/forest"
            className="rounded-full border border-white/15 bg-white/[0.05] px-5 py-2 text-xs font-medium text-zinc-200 transition hover:border-white/25 hover:bg-white/[0.08]"
          >
            Community
          </Link>
          <button
            type="button"
            onClick={dismiss}
            className="rounded-full p-2 text-zinc-600 transition hover:bg-white/5 hover:text-zinc-300"
            aria-label="Dismiss banner"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
