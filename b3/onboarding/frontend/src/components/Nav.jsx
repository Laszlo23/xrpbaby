import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Menu,
  X,
  Sparkles,
  Layers,
  Coins,
  TrendingUp,
  Briefcase,
  Map,
  UserPlus,
  ArrowUpRight,
} from "lucide-react";
import { ECOSYSTEM_EXTERNAL_CTA } from "../lib/media";

const NAV_ITEMS = [
  { label: "Vision", href: "#vision", icon: Sparkles },
  { label: "Ecosystem", href: "#ecosystem", icon: Layers },
  { label: "BCD", href: "#bcd", icon: Coins },
  { label: "Impact", href: "#impact", icon: TrendingUp },
  { label: "Investors", href: "#investors", icon: Briefcase },
  { label: "Roadmap", href: "#future", icon: Map },
];

const NavLink = ({ item, className, onClick, testId }) => {
  const Icon = item.icon;
  return (
    <a
      href={item.href}
      onClick={onClick}
      data-testid={testId}
      className={className}
    >
      <Icon size={15} strokeWidth={2} className="shrink-0 opacity-70" aria-hidden />
      {item.label}
    </a>
  );
};

export const Nav = () => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <motion.header
      initial={{ y: -40, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
      className={`fixed top-0 inset-x-0 z-50 transition-all duration-500 ${
        scrolled ? "py-3" : "py-5"
      }`}
      data-testid="main-nav"
    >
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div
          className={`flex items-center justify-between rounded-full px-4 sm:px-6 py-2.5 transition-all duration-500 ${
            scrolled ? "bc-glass-strong" : "bc-glass"
          }`}
        >
          <a
            href="#top"
            data-testid="nav-logo"
            className="flex items-center gap-2.5 group"
          >
            <img
              src={`${process.env.PUBLIC_URL}/bs_trans.png`}
              alt="Building Culture"
              className="h-8 w-auto object-contain transition-opacity duration-300 group-hover:opacity-90"
              width={32}
              height={32}
            />
            <span className="font-display font-bold text-[15px] tracking-tight">
              Building Culture
            </span>
          </a>

          <nav className="hidden md:flex items-center gap-6">
            {NAV_ITEMS.map((it) => (
              <NavLink
                key={it.href}
                item={it}
                testId={`nav-link-${it.label.toLowerCase()}`}
                className="inline-flex items-center gap-1.5 text-[13px] text-zinc-400 hover:text-white transition-colors font-medium [&:hover_svg]:opacity-100"
              />
            ))}
          </nav>

          <div className="flex items-center gap-2">
            <a
              href={ECOSYSTEM_EXTERNAL_CTA}
              target="_blank"
              rel="noopener noreferrer"
              data-testid="nav-cta-join"
              className="hidden sm:inline-flex items-center gap-1.5 rounded-full bg-[#C5FF41] px-4 py-2 text-[13px] font-semibold text-black hover:bg-white transition-colors"
            >
              <UserPlus size={15} strokeWidth={2.25} aria-hidden />
              Join
              <ArrowUpRight size={14} strokeWidth={2.25} className="opacity-60" aria-hidden />
            </a>
            <button
              onClick={() => setOpen((v) => !v)}
              data-testid="nav-menu-toggle"
              className="md:hidden inline-flex h-9 w-9 items-center justify-center rounded-full border border-white/10 text-white"
              aria-label="Toggle menu"
            >
              {open ? <X size={16} /> : <Menu size={16} />}
            </button>
          </div>
        </div>

        <AnimatePresence>
          {open && (
            <motion.div
              initial={{ opacity: 0, y: -8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              className="md:hidden mt-2 rounded-2xl bc-glass-strong p-4"
              data-testid="mobile-menu"
            >
              <div className="flex flex-col gap-3">
                {NAV_ITEMS.map((it) => (
                  <NavLink
                    key={it.href}
                    item={it}
                    onClick={() => setOpen(false)}
                    testId={`mobile-nav-${it.label.toLowerCase()}`}
                    className="inline-flex items-center gap-2.5 text-[15px] text-zinc-300 hover:text-white [&:hover_svg]:opacity-100"
                  />
                ))}
                <a
                  href={ECOSYSTEM_EXTERNAL_CTA}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center justify-center gap-2 rounded-full bg-[#C5FF41] px-4 py-2.5 text-[13px] font-semibold text-black"
                  data-testid="mobile-cta-join"
                >
                  <UserPlus size={16} strokeWidth={2.25} aria-hidden />
                  Join Building Culture
                  <ArrowUpRight size={15} strokeWidth={2.25} className="opacity-60" aria-hidden />
                </a>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.header>
  );
};

export default Nav;
