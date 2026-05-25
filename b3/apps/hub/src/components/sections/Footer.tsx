import { motion } from "framer-motion";
import {
  Globe, Layers, AppWindow, Leaf,
  Coins, Sparkles, BookOpen, Github,
  FileText, Users, Briefcase, Mail,
  Send, AtSign,
} from "lucide-react";
import { COMMUNITY_TELEGRAM_INVITE_URL, COMMUNITY_X_URL } from "@/lib/community-links";

const cols = [
  {
    title: "ecosystem",
    links: [
      { l: "0x.buildingculture.capital", h: "https://0x.buildingculture.capital", i: Globe },
      { l: "buildingculture.capital", h: "https://buildingculture.capital", i: Layers },
      { l: "app.buildingculture.capital", h: "https://app.buildingculture.capital", i: AppWindow },
      { l: "eco.buildingculture.capital", h: "https://eco.buildingculture.capital", i: Leaf },
    ],
  },
  {
    title: "community",
    links: [
      { l: "follow on X — @buildingcultu3", h: COMMUNITY_X_URL, i: AtSign },
      { l: "join Telegram", h: COMMUNITY_TELEGRAM_INVITE_URL, i: Send },
    ],
  },
  {
    title: "build",
    links: [
      { l: "$BCD token", h: "#", i: Coins },
      { l: "mini app", h: "https://miniapp-generator-fid-873944-260306170037188.neynar.app?fid=873944", i: Sparkles },
      { l: "community guide", h: "/guide", i: BookOpen },
      { l: "github", h: "#", i: Github },
    ],
  },
  {
    title: "company",
    links: [
      { l: "manifesto", h: "#", i: FileText },
      { l: "team", h: "https://0x.buildingculture.capital/team", i: Users },
      { l: "careers", h: "#", i: Briefcase },
      { l: "contact", h: "#", i: Mail },
    ],
  },
];

const legal = [
  { l: "privacy policy", h: "#" },
  { l: "terms of service", h: "#" },
  { l: "cookies", h: "#" },
  { l: "risk disclosure", h: "#" },
  { l: "imprint", h: "#" },
];

const XIcon = ({ className = "" }: { className?: string }) => (
  <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden="true">
    <path d="M18.244 2H21.5l-7.5 8.57L23 22h-6.873l-5.39-6.62L4.5 22H1.244l8.04-9.18L1 2h7.043l4.86 6.04L18.244 2zm-2.41 18h1.85L7.27 4h-1.94l10.504 16z" />
  </svg>
);


export const Footer = () => {
  return (
    <footer className="relative overflow-hidden border-t border-border/60 bg-background px-6 py-20 md:px-16 lg:px-24">
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-primary/40 to-transparent" />

      <div className="mx-auto max-w-7xl">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 1 }}
          className="grid grid-cols-1 gap-12 lg:grid-cols-[1.5fr_2fr]"
        >
          <div>
            <div className="font-display text-4xl tracking-tight md:text-5xl">
              building<span className="text-gold">·</span>culture
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              an open ecosystem for ownership, capital and community. live on mainnet. built in public.
            </p>
            <div className="mt-8 flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-2 rounded-full border border-secondary-glow/40 bg-secondary/10 px-3 py-1.5 font-mono text-[10px] uppercase tracking-[0.25em] text-eco">
                <span className="h-1.5 w-1.5 rounded-full bg-secondary-glow animate-pulse-glow" />
                all systems live
              </span>
              <a
                href={COMMUNITY_X_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="X / Twitter"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-all duration-500 hover:border-primary/60 hover:text-foreground hover:glow-gold"
              >
                <XIcon className="h-4 w-4" />
              </a>
              <a
                href={COMMUNITY_TELEGRAM_INVITE_URL}
                target="_blank"
                rel="noopener noreferrer"
                aria-label="Telegram"
                className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-border/60 bg-card/40 text-muted-foreground transition-all duration-500 hover:border-secondary-glow hover:text-foreground hover:glow-eco"
              >
                <Send className="h-4 w-4" />
              </a>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-10 xs:grid-cols-2 lg:grid-cols-4">
            {cols.map((c) => (
              <div key={c.title}>
                <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-gold">{c.title}</p>
                <ul className="mt-5 space-y-3">
                  {c.links.map((link) => {
                    const Ico = link.i;
                    return (
                      <li key={link.l}>
                        <a
                          href={link.h}
                          target={link.h.startsWith("http") ? "_blank" : undefined}
                          rel="noopener noreferrer"
                          className="group inline-flex items-start gap-2.5 text-sm text-muted-foreground transition-colors hover:text-foreground"
                        >
                          <Ico className="mt-1 h-3.5 w-3.5 flex-shrink-0 text-gold/70 transition-all duration-500 group-hover:text-gold group-hover:translate-x-0.5" />
                          <span className="relative break-all">
                            {link.l}
                            <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-primary transition-all duration-500 group-hover:w-full" />
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="mt-20 border-t border-border/60 pt-10">
          <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-wrap gap-x-6 gap-y-3">
              {legal.map((l) => (
                <a
                  key={l.l}
                  href={l.h}
                  className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground transition-colors hover:text-foreground"
                >
                  {l.l}
                </a>
              ))}
            </div>
            <p className="font-mono text-[10px] uppercase tracking-[0.3em] text-muted-foreground">
              © {new Date().getFullYear()} building culture · all rights reserved
            </p>
          </div>

          <p className="mt-8 max-w-4xl text-[11px] leading-relaxed text-muted-foreground/70">
            disclaimer: $BCD and related products are experimental software deployed on public blockchain networks. nothing on this site constitutes financial, legal or investment advice. digital assets are volatile and may lose value. participate only with what you can afford to lose. always do your own research.
          </p>
        </div>
      </div>
    </footer>
  );
};
