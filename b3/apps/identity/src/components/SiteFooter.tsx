import { Link } from "@tanstack/react-router";
import { MessageCircle } from "lucide-react";
import { BrandLogoMark } from "@/components/BrandLogo";

const DISCORD_URL = "https://discord.gg/cze3fPkzEC";

export function SiteFooter() {
  return (
    <footer className="relative border-t border-border px-4 py-12">
      <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-6 sm:flex-row">
        <div className="flex items-center gap-2">
          <BrandLogoMark className="h-7 w-7 object-contain" />
          <span className="font-display text-sm">
            culture<span className="text-muted-foreground">.layer</span>
          </span>
        </div>

        <nav
          className="flex flex-wrap items-center justify-center gap-x-4 gap-y-2 font-mono text-[10px] uppercase tracking-[0.2em] text-muted-foreground/70"
          aria-label="Footer"
        >
          <Link to="/privacy" className="transition hover:text-muted-foreground">
            Privacy
          </Link>
          <span className="text-border" aria-hidden>
            ·
          </span>
          <Link to="/terms" className="transition hover:text-muted-foreground">
            Terms
          </Link>
          <span className="text-border" aria-hidden>
            ·
          </span>
          <a
            href={DISCORD_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 transition hover:text-muted-foreground"
          >
            <MessageCircle size={12} strokeWidth={1.75} aria-hidden />
            Discord
          </a>
        </nav>

        <div className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
          building culture · since 2026
        </div>
      </div>
    </footer>
  );
}
