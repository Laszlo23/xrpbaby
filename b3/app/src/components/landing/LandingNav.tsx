import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  ArrowUpRight,
  Briefcase,
  Coins,
  Layers,
  Map,
  Menu,
  Sparkles,
  TrendingUp,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";

import { LANDING_MEDIA } from "@/lib/landing-media";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "Vision", href: "#vision", icon: Sparkles },
  { label: "Ecosystem", href: "#ecosystem", icon: Layers },
  { label: "BCD", href: "#bcd", icon: Coins },
  { label: "Impact", href: "#impact", icon: TrendingUp },
  { label: "Investors", href: "#investors", icon: Briefcase },
  { label: "Roadmap", href: "#future", icon: Map },
];

type LandingNavProps = {
  /** Compact variant for community hub */
  compact?: boolean;
};

export function LandingNav({ compact = false }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = compact
    ? NAV_ITEMS.filter((i) => ["Ecosystem", "Impact"].includes(i.label))
    : NAV_ITEMS;

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-500 ${scrolled ? "py-3" : "py-5"}`}
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div
          className={`flex items-center justify-between rounded-full px-4 py-2.5 transition-all duration-500 sm:px-6 ${
            scrolled ? "bc-glass-strong" : "bc-glass"
          }`}
        >
          <a href="/#top" className="group flex items-center gap-2.5">
            <img
              src={LANDING_MEDIA.logo}
              alt="Building Culture"
              className="h-8 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
              width={32}
              height={32}
            />
            <span className="font-display text-[15px] font-bold tracking-tight">
              Building Culture
            </span>
          </a>

          <nav className="hidden items-center gap-6 md:flex">
            {items.map((it) => {
              const href = compact && it.href.startsWith("#") ? `/${it.href}` : it.href;
              return (
                <a
                  key={it.href}
                  href={href}
                  className="inline-flex items-center gap-1.5 text-[13px] font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <it.icon size={15} strokeWidth={2} className="shrink-0 opacity-70" aria-hidden />
                  {it.label}
                </a>
              );
            })}
          </nav>

          <motion.div className="flex items-center gap-2">
            <Link
              to="/join"
              className="hidden items-center gap-1.5 rounded-full bg-[#C5FF41] px-4 py-2 text-[13px] font-semibold text-black transition-colors hover:bg-white sm:inline-flex"
            >
              <UserPlus size={15} strokeWidth={2.25} aria-hidden />
              Join
              <ArrowUpRight size={14} strokeWidth={2.25} className="opacity-60" aria-hidden />
            </Link>
            <button
              type="button"
              onClick={() => setOpen((v) => !v)}
              className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white md:hidden"
              aria-label="Toggle menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </motion.div>
        </div>

        <AnimatePresence>
          {open ? (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="mt-2 rounded-2xl bc-glass-strong p-4 md:hidden"
            >
              <div className="flex flex-col gap-3">
                {items.map((it) => {
                  const href = compact && it.href.startsWith("#") ? `/${it.href}` : it.href;
                  return (
                    <a
                      key={it.href}
                      href={href}
                      onClick={() => setOpen(false)}
                      className="inline-flex items-center gap-2.5 text-[15px] text-zinc-300 hover:text-white"
                    >
                      <it.icon size={15} strokeWidth={2} aria-hidden />
                      {it.label}
                    </a>
                  );
                })}
                <Link
                  to="/join"
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-4 py-2.5 text-[13px] font-semibold text-black"
                >
                  <UserPlus size={16} strokeWidth={2.25} aria-hidden />
                  Join Building Culture
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
