import { motion } from "framer-motion";
import {
  ArrowUpRight,
  Bot,
  Briefcase,
  Compass,
  Fingerprint,
  Gamepad2,
  Home,
  Layers,
  Mail,
  Map,
  Palette,
  Rocket,
  Send,
  Sparkles,
  type LucideIcon,
} from "lucide-react";

import { LANDING_MEDIA, LANDING_SOCIAL } from "@/lib/landing-media";

function DiscordIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037 12.3 12.3 0 0 0-.608 1.25 18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z" />
    </svg>
  );
}

function XIcon({ size = 16, className }: { size?: number; className?: string }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
      className={className}
      aria-hidden
    >
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}

const SOCIAL_LINKS = [
  { label: "x", href: LANDING_SOCIAL.x, Icon: XIcon, title: "X @buildingcultu3" },
  { label: "telegram", href: LANDING_SOCIAL.telegram, Icon: Send, title: "Telegram" },
  { label: "discord", href: LANDING_SOCIAL.discord, Icon: DiscordIcon, title: "Discord" },
] as const;

function FooterCol({
  title,
  links,
}: {
  title: string;
  links: { l: string; h: string; Icon: LucideIcon }[];
}) {
  return (
    <div>
      <p className="mono-label mb-4 text-zinc-500">{title}</p>
      <ul className="space-y-3">
        {links.map((l) => {
          const external = l.h.startsWith("http") || l.h.startsWith("mailto:");
          return (
            <li key={l.l}>
              <a
                href={l.h}
                target={external ? "_blank" : undefined}
                rel={external ? "noopener noreferrer" : undefined}
                className="group inline-flex items-center gap-2 text-sm text-zinc-400 transition-colors hover:text-white"
              >
                <span className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-lg border border-white/10 bg-white/5 text-zinc-500 transition-colors group-hover:border-[#00E5FF]/30 group-hover:text-[#00E5FF]">
                  <l.Icon size={13} aria-hidden />
                </span>
                {l.l}
                {external && l.h.startsWith("http") ? (
                  <ArrowUpRight
                    size={12}
                    className="-translate-x-1 opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100"
                    aria-hidden
                  />
                ) : null}
              </a>
            </li>
          );
        })}
      </ul>
    </div>
  );
}

export function LandingFooter() {
  return (
    <footer className="relative border-t border-white/5 bg-[#050505] py-16">
      <div className="mx-auto max-w-7xl px-5 sm:px-8">
        <div className="grid grid-cols-1 gap-10 md:grid-cols-12">
          <motion.div className="md:col-span-5">
            <div className="flex items-center gap-2.5">
              <img
                src={LANDING_MEDIA.logo}
                alt="Building Culture"
                className="h-8 w-auto object-contain"
                width={32}
                height={32}
              />
              <span className="font-display text-lg font-bold tracking-tight">
                Building Culture
              </span>
            </div>
            <p className="mt-5 max-w-md text-sm leading-relaxed text-zinc-400">
              A new way to fund, build, own and experience real-world communities. Not through
              banks. Through people.
            </p>
            <div className="mt-6 flex items-center gap-3">
              {SOCIAL_LINKS.map(({ Icon, label, href, title }) => (
                <a
                  key={label}
                  href={href}
                  target="_blank"
                  rel="noopener noreferrer"
                  title={title}
                  aria-label={title}
                  className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 text-zinc-400 transition-colors hover:border-cyan-400/40 hover:text-white"
                >
                  <Icon size={16} />
                </a>
              ))}
            </div>
          </motion.div>

          <div className="grid grid-cols-2 gap-8 sm:grid-cols-3 md:col-span-7">
            <FooterCol
              title="Ecosystem"
              links={[
                { l: "Capital", h: "https://buildingculture.capital", Icon: Compass },
                { l: "App", h: "/play", Icon: Layers },
                { l: "Home", h: "https://home.buildingculture.capital", Icon: Home },
                { l: "ID", h: "/join", Icon: Fingerprint },
              ]}
            />
            <FooterCol
              title="Layers"
              links={[
                { l: "Art", h: "/drops/art", Icon: Palette },
                { l: "WohnAI", h: "https://wohnai.buildingcultureid.space", Icon: Bot },
                { l: "Game", h: "https://game.buildingculture.capital", Icon: Gamepad2 },
                { l: "Community", h: "/forest", Icon: Rocket },
              ]}
            />
            <FooterCol
              title="Company"
              links={[
                { l: "Vision", h: "#vision", Icon: Sparkles },
                { l: "Investors", h: "#investors", Icon: Briefcase },
                { l: "Roadmap", h: "#future", Icon: Map },
                { l: "Contact", h: "mailto:hello@buildingculture.capital", Icon: Mail },
              ]}
            />
          </div>
        </div>

        <motion.div
          initial={{ opacity: 0 }}
          whileInView={{ opacity: 1 }}
          viewport={{ once: true }}
          className="mt-16 flex flex-col items-start justify-between gap-4 border-t border-white/5 pt-8 md:flex-row md:items-center"
        >
          <p className="font-mono text-xs text-zinc-500">
            © {new Date().getFullYear()} BUILDING CULTURE — BUILT BY PEOPLE.
          </p>
          <p className="text-xs text-zinc-500">Vienna · Austria · Worldwide</p>
        </motion.div>
      </div>
    </footer>
  );
}
