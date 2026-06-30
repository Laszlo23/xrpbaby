import { useEffect, useState } from "react";
import { Link } from "@tanstack/react-router";
import { HeaderConnectButton } from "@/components/HeaderConnectButton";
import { WalletAccountMenu } from "@/components/wallet/WalletAccountMenu";
import { useWalletSession } from "@/hooks/useWalletSession";
import { AnimatePresence, motion } from "@/components/landing/motion";
import {
  Building2,
  Fingerprint,
  Layers,
  Menu,
  Shield,
  Star,
  Unlock,
  UserPlus,
  X,
  type LucideIcon,
} from "lucide-react";

import { LANDING_MEDIA } from "@/lib/landing-media";

const NAV_ITEMS: { label: string; href: string; icon: LucideIcon; external?: boolean }[] = [
  { label: "Identity", href: "/pass", icon: Fingerprint },
  { label: "Places", href: "/places", icon: Building2 },
  { label: "Credentials", href: "/credentials", icon: Shield },
  { label: "Reputation", href: "/credentials/leaderboard", icon: Star },
  { label: "Connect", href: "/connect", icon: Unlock, external: true },
  { label: "Ecosystem", href: "/ecosystem", icon: Layers, external: true },
];

const CONNECTED_NAV: { label: string; to: string; icon: LucideIcon }[] = [
  { label: "Dashboard", to: "/forest", icon: Layers },
  { label: "Connect", to: "/connect", icon: Unlock },
  { label: "Profile", to: "/profile", icon: Fingerprint },
  { label: "Ecosystem", to: "/ecosystem", icon: Star },
];

type LandingNavProps = {
  /** Compact variant for community hub */
  compact?: boolean;
};

export function LandingNav({ compact = false }: LandingNavProps) {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { wasConnected } = useWalletSession();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  const items = compact
    ? wasConnected
      ? CONNECTED_NAV.map((i) => ({ label: i.label, href: i.to, icon: i.icon, external: true }))
      : NAV_ITEMS.filter((i) => ["Identity", "Ecosystem"].includes(i.label))
    : wasConnected
      ? CONNECTED_NAV.map((i) => ({ label: i.label, href: i.to, icon: i.icon, external: true }))
      : NAV_ITEMS;

  const resolveHref = (item: (typeof NAV_ITEMS)[number]) => {
    if (item.external) return item.href;
    return compact && item.href.startsWith("#") ? `/${item.href}` : item.href;
  };

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

          <nav className="hidden items-center gap-5 xl:flex">
            {items.map((it) => {
              const href = resolveHref(it);
              if (it.external) {
                return (
                  <Link
                    key={it.href}
                    to={href}
                    className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:text-white"
                  >
                    <it.icon
                      size={14}
                      strokeWidth={2}
                      className="shrink-0 opacity-70"
                      aria-hidden
                    />
                    {it.label}
                  </Link>
                );
              }
              return (
                <a
                  key={it.href}
                  href={href}
                  className="inline-flex items-center gap-1.5 text-[12px] font-medium text-zinc-400 transition-colors hover:text-white"
                >
                  <it.icon size={14} strokeWidth={2} className="shrink-0 opacity-70" aria-hidden />
                  {it.label}
                </a>
              );
            })}
          </nav>

          <motion.div className="flex items-center gap-2">
            {wasConnected ? (
              <div className="hidden sm:block">
                <WalletAccountMenu showIdentityBar />
              </div>
            ) : (
              <HeaderConnectButton />
            )}
            {wasConnected ? (
              <Link
                to="/forest"
                className="hidden items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white transition hover:border-[#C5FF41]/40 sm:inline-flex"
              >
                Dashboard
              </Link>
            ) : (
              <Link
                to="/join"
                className="hidden items-center gap-1.5 rounded-full border border-white/15 px-4 py-2 text-[13px] font-semibold text-white transition hover:border-[#C5FF41]/40 sm:inline-flex"
              >
                <UserPlus size={15} strokeWidth={2.25} aria-hidden />
                Join
              </Link>
            )}
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
                  const href = resolveHref(it);
                  if (it.external) {
                    return (
                      <Link
                        key={it.href}
                        to={href}
                        onClick={() => setOpen(false)}
                        className="inline-flex items-center gap-2.5 text-[15px] text-zinc-300 hover:text-white"
                      >
                        <it.icon size={15} strokeWidth={2} aria-hidden />
                        {it.label}
                      </Link>
                    );
                  }
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
                {!wasConnected ? (
                  <div className="mt-2 sm:hidden">
                    <HeaderConnectButton className="w-full justify-center" />
                  </div>
                ) : null}
                <Link
                  to={wasConnected ? "/forest" : "/join"}
                  onClick={() => setOpen(false)}
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full border border-white/15 px-4 py-2.5 text-[13px] font-semibold text-white"
                >
                  <UserPlus size={16} strokeWidth={2.25} aria-hidden />
                  {wasConnected ? "Open dashboard" : "Join Building Culture"}
                </Link>
              </div>
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </motion.header>
  );
}
