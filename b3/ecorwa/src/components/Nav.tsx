import { useEffect, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  Activity,
  ArrowRight,
  ExternalLink,
  Gamepad2,
  Landmark,
  Menu,
  Scale,
  Share2,
  ShieldCheck,
  Split,
  UsersRound,
  X,
} from "lucide-react";
import { buildchainAppUrl } from "@/lib/site-urls";
import type { BcTheme } from "@/lib/theme";
import { themeMeta } from "@/lib/theme";
import { cn } from "@/lib/utils";

const links: { label: string; href: string; icon: LucideIcon }[] = [
  { label: "happening", href: "#happening", icon: Activity },
  { label: "financing", href: "#bank-vs-community", icon: Landmark },
  { label: "futures", href: "#two-futures", icon: Split },
  { label: "ripple", href: "#ripple", icon: Share2 },
  { label: "proof", href: "#project", icon: ShieldCheck },
  { label: "decide", href: "#you-decide", icon: Scale },
  { label: "builders", href: "#builders", icon: UsersRound },
];

const navLinkClass =
  "inline-flex items-center gap-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground hover:text-primary transition-colors";

export type NavProps = {
  theme: BcTheme;
  /** When set (e.g. `/land`), in-page section links open the storyline hub (happening, futures, …). */
  storyHubHref?: string;
  /** CTA target for “join” (defaults to `#join` on the current page). */
  joinHref?: string;
};

export const Nav = ({ theme, storyHubHref = "", joinHref = "#join" }: NavProps) => {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 30);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <header
      className={cn(
        "fixed top-0 inset-x-0 z-50 transition-all duration-500",
        scrolled ? "py-3 bg-background/75 backdrop-blur-xl border-b border-border/60" : "py-4 md:py-5",
      )}
    >
      <div className="container flex w-full items-center gap-3 px-5 md:px-6">
        <a href={storyHubHref ? `${storyHubHref}#top` : "#top"} className="flex min-w-0 shrink-0 items-center gap-2.5 group">
          <span className="relative flex h-2 w-2 shrink-0">
            <span className="absolute inset-0 rounded-full bg-primary pulse-dot" />
            <span className="relative rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="truncate font-mono text-[11px] uppercase tracking-[0.22em] md:text-xs">
            Building<span className="text-muted-foreground mx-1">·</span>
            <span className="text-acid">Culture</span>
            <span className="text-muted-foreground mx-1">·</span>
            <span className="text-acid">{themeMeta[theme].logoSuffix}</span>
          </span>
        </a>

        <nav className="hidden min-w-0 flex-1 items-center justify-center gap-6 lg:flex xl:gap-7">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <a key={l.href} href={`${storyHubHref}${l.href}`} className={navLinkClass}>
                <Icon className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.5} aria-hidden />
                {l.label}
              </a>
            );
          })}
          <a
            href={buildchainAppUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className={cn(navLinkClass, "text-accent hover:text-primary")}
          >
            <Gamepad2 className="h-3.5 w-3.5 shrink-0 opacity-70" strokeWidth={1.5} aria-hidden />
            play
            <ExternalLink className="h-3 w-3 shrink-0 opacity-50" strokeWidth={1.5} aria-hidden />
          </a>
        </nav>

        <div className="ml-auto flex shrink-0 items-center gap-1.5 sm:gap-2">
          <a
            href={joinHref}
            className="btn-ghost-acid inline-flex items-center gap-1.5 !py-2 !px-3 !text-[10px] uppercase tracking-widest sm:!px-4"
          >
            join
            <ArrowRight className="h-3.5 w-3.5 shrink-0" strokeWidth={2} aria-hidden />
          </a>
          <button
            type="button"
            className="p-1.5 text-foreground lg:hidden -mr-1"
            onClick={() => setOpen(!open)}
            aria-expanded={open}
            aria-label={open ? "Close menu" : "Open menu"}
          >
            {open ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {open && (
        <div className="mx-4 mt-3 flex flex-col gap-2 rounded-2xl glass p-5 lg:hidden">
          {links.map((l) => {
            const Icon = l.icon;
            return (
              <a
                key={l.href}
                href={`${storyHubHref}${l.href}`}
                onClick={() => setOpen(false)}
                className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-foreground"
              >
                <Icon className="h-4 w-4 shrink-0 text-primary" strokeWidth={1.5} aria-hidden />
                {l.label}
              </a>
            );
          })}
          <a
            href={buildchainAppUrl()}
            target="_blank"
            rel="noreferrer noopener"
            className="flex items-center gap-3 text-sm font-mono uppercase tracking-widest text-accent"
          >
            <Gamepad2 className="h-4 w-4 shrink-0" strokeWidth={1.5} aria-hidden />
            play
            <ExternalLink className="ml-auto h-3.5 w-3.5 opacity-60" strokeWidth={1.5} aria-hidden />
          </a>
          <a
            href={joinHref}
            onClick={() => setOpen(false)}
            className="btn-acid mt-2 inline-flex !justify-center items-center gap-2 text-xs"
          >
            join the revival
            <ArrowRight className="h-4 w-4" strokeWidth={2} aria-hidden />
          </a>
        </div>
      )}
    </header>
  );
};
