import type { ReactNode } from "react";
import Image from "next/image";
import Link from "next/link";
import { BetaNoticeTrigger } from "@/components/BetaWelcomeModal";
import { FooterSocialLinks } from "@/components/FooterSocialLinks";
import { baseExplorerBase } from "@/lib/base-addresses";
import { REFERENCE_YIELD_BAND_LABEL } from "@/lib/demo-properties";

/** 16×16 stroke icons — match Nav.tsx weight for visual consistency */
function Fi({
  children,
  className = "h-4 w-4 shrink-0",
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      {children}
    </svg>
  );
}

const footerIcons = {
  overview: (
    <Fi>
      <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="9 22 9 12 15 12 15 22" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  properties: (
    <Fi>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 11h.01M12 11h.01M15 11h.01" strokeLinecap="round" />
    </Fi>
  ),
  invest: (
    <Fi>
      <line x1="12" y1="1" x2="12" y2="23" strokeLinecap="round" />
      <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
    </Fi>
  ),
  trade: (
    <Fi>
      <polyline points="17 1 21 5 17 9" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14M7 23l-4-4 4-4" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  portfolio: (
    <Fi>
      <rect x="2" y="7" width="20" height="14" rx="2" ry="2" />
      <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" />
    </Fi>
  ),
  pool: (
    <Fi>
      <path d="M12 22a8 8 0 0 0 8-8c0-4-8-12-8-12S4 10 4 14a8 8 0 0 0 8 8z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  stake: (
    <Fi>
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" strokeLinecap="round" />
    </Fi>
  ),
  transparency: (
    <Fi>
      <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" strokeLinecap="round" strokeLinejoin="round" />
      <circle cx="12" cy="12" r="3" />
    </Fi>
  ),
  immersive: (
    <Fi>
      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  howItWorks: (
    <Fi>
      <circle cx="12" cy="12" r="10" />
      <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3M12 17h.01" strokeLinecap="round" />
    </Fi>
  ),
  guestbook: (
    <Fi>
      <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  cultureLand: (
    <Fi>
      <path d="M12 3l9 4.5v5c0 5.25-3.75 10-9 11.5C6.75 22.5 3 17.75 3 12.5V7.5L12 3z" strokeLinejoin="round" />
      <path d="M12 8v13M8 12h8" strokeLinecap="round" />
    </Fi>
  ),
  documents: (
    <Fi>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" />
      <line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" />
    </Fi>
  ),
  build: (
    <Fi>
      <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  guide: (
    <Fi>
      <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" strokeLinecap="round" />
      <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  blog: (
    <Fi>
      <path d="M4 11a9 9 0 0 1 9 9" strokeLinecap="round" />
      <path d="M4 4a16 16 0 0 1 16 16" strokeLinecap="round" />
      <circle cx="5" cy="19" r="1" />
    </Fi>
  ),
  feedback: (
    <Fi>
      <path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  roadmap: (
    <Fi>
      <line x1="12" y1="20" x2="12" y2="10" strokeLinecap="round" />
      <line x1="18" y1="20" x2="18" y2="4" strokeLinecap="round" />
      <line x1="6" y1="20" x2="6" y2="16" strokeLinecap="round" />
    </Fi>
  ),
  mission: (
    <Fi>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" strokeLinecap="round" />
    </Fi>
  ),
  team: (
    <Fi>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </Fi>
  ),
  legalOverview: (
    <Fi>
      <path d="M12 3l9 4.5v5c0 5.25-3.75 10-9 11.5C6.75 22.5 3 17.75 3 12.5V7.5L12 3z" strokeLinejoin="round" />
      <path d="M12 12v6M12 9h.01" strokeLinecap="round" />
    </Fi>
  ),
  offerings: (
    <Fi>
      <polygon points="12 2 2 7 12 12 22 7 12 2" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 17 12 22 22 17" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="2 12 12 17 22 12" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  terms: (
    <Fi>
      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="9" y1="15" x2="15" y2="15" strokeLinecap="round" />
    </Fi>
  ),
  privacy: (
    <Fi>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  risk: (
    <Fi>
      <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="12" y1="9" x2="12" y2="13" strokeLinecap="round" />
      <line x1="12" y1="17" x2="12.01" y2="17" strokeLinecap="round" />
    </Fi>
  ),
  contracts: (
    <Fi>
      <polyline points="16 18 22 12 16 6" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="8 6 2 12 8 18" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  issuer: (
    <Fi>
      <line x1="12" y1="19" x2="12" y2="5" strokeLinecap="round" />
      <polyline points="5 12 12 5 19 12" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  verifyContracts: (
    <Fi>
      <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" strokeLinecap="round" strokeLinejoin="round" />
      <polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  beta: (
    <Fi>
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  external: (
    <Fi>
      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" strokeLinecap="round" strokeLinejoin="round" />
    </Fi>
  ),
  communityHub: (
    <Fi>
      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" strokeLinecap="round" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75" strokeLinecap="round" />
    </Fi>
  ),
} as const;

type FooterLinkItem = { href: string; label: string; icon: ReactNode };

const product: FooterLinkItem[] = [
  { href: "/", label: "Overview", icon: footerIcons.overview },
  { href: "/properties", label: "Properties", icon: footerIcons.properties },
  { href: "/invest", label: "Invest", icon: footerIcons.invest },
  { href: "/trade", label: "Trade", icon: footerIcons.trade },
  { href: "/portfolio", label: "Portfolio", icon: footerIcons.portfolio },
  { href: "/pool", label: "Pool", icon: footerIcons.pool },
  { href: "/stake", label: "Stake", icon: footerIcons.stake },
  { href: "/contracts", label: "Smart contracts", icon: footerIcons.contracts },
  { href: "/issuer", label: "Issuer portal", icon: footerIcons.issuer },
];

/** Split Learn across two balanced columns (7 + 6) */
const learnColA: FooterLinkItem[] = [
  { href: "/transparency", label: "Transparency", icon: footerIcons.transparency },
  { href: "/experience", label: "Immersive story", icon: footerIcons.immersive },
  { href: "/how-it-works", label: "How it works", icon: footerIcons.howItWorks },
  { href: "/guestbook", label: "On-chain guestbook", icon: footerIcons.guestbook },
  { href: "/culture-land", label: "Culture Land portfolio", icon: footerIcons.cultureLand },
  { href: "/documents", label: "Plan library", icon: footerIcons.documents },
  { href: "/build-with-us", label: "Build with us", icon: footerIcons.build },
];

const learnColB: FooterLinkItem[] = [
  { href: "/guide", label: "Operator guide", icon: footerIcons.guide },
  { href: "/blog", label: "Blog", icon: footerIcons.blog },
  { href: "/feedback", label: "Feedback", icon: footerIcons.feedback },
  { href: "/roadmap", label: "Roadmap", icon: footerIcons.roadmap },
  { href: "/mission", label: "Mission", icon: footerIcons.mission },
  { href: "/team", label: "Team", icon: footerIcons.team },
];

const legal: FooterLinkItem[] = [
  { href: "/legal", label: "Legal overview", icon: footerIcons.legalOverview },
  { href: "/legal/offerings", label: "Offerings structure", icon: footerIcons.offerings },
  { href: "/legal/terms", label: "Terms of use", icon: footerIcons.terms },
  { href: "/legal/privacy", label: "Privacy policy", icon: footerIcons.privacy },
  { href: "/legal/risk", label: "Risks & disclaimer", icon: footerIcons.risk },
];

function LinkCol({
  title,
  items,
  hideTitle,
}: {
  title: string;
  items: FooterLinkItem[];
  /** Reserve heading space so the list lines up with the previous “Learn” column */
  hideTitle?: boolean;
}) {
  return (
    <div>
      <p
        className={`text-xs font-medium uppercase tracking-wider text-zinc-500 ${hideTitle ? "invisible" : ""}`}
        aria-hidden={hideTitle || undefined}
      >
        {title}
      </p>
      <ul className="mt-3 space-y-2">
        {items.map((l) => (
          <li key={l.href}>
            <Link
              href={l.href}
              className="inline-flex min-h-[44px] items-center gap-2 py-2 text-sm text-zinc-400 transition hover:text-brand md:min-h-0 md:py-0"
            >
              {l.icon}
              {l.label}
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}

export function Footer() {
  return (
    <footer className="mt-20 border-t border-white/[0.06] bg-black/40">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-12 lg:grid-cols-12 lg:gap-x-10 lg:gap-y-12">
          <div className="lg:col-span-5">
            <p className="text-xs font-medium uppercase tracking-wider text-eco-muted">Mission</p>
            <p className="mt-3 text-lg font-semibold tracking-tight text-white">Building Culture</p>
            <p className="mt-3 max-w-md text-sm leading-relaxed text-zinc-400">
              We open culture-rich real estate to transparent, programmable liquidity — so places people care about can be
              financed and traded with the community in the loop.
            </p>
            <blockquote className="mt-6 border-l-2 border-eco/35 pl-4">
              <p className="text-sm italic leading-relaxed text-zinc-300">
                “Places hold memory. Markets should hold integrity — together they hold the future we build.”
              </p>
            </blockquote>
            <div className="mt-6 flex flex-wrap gap-x-5 gap-y-2 text-sm">
              <Link
                href="/community"
                className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-brand"
              >
                {footerIcons.communityHub}
                Community hub
              </Link>
              <Link href="/mission" className="inline-flex items-center gap-2 text-zinc-400 transition hover:text-brand">
                {footerIcons.mission}
                Why we exist
              </Link>
            </div>
            <FooterSocialLinks />
            <div className="mt-6 flex flex-wrap items-center gap-6">
              <a
                href="https://www.base.org"
                target="_blank"
                rel="noreferrer"
                className="opacity-90 transition hover:opacity-100"
                aria-label="Base"
              >
                <Image src="/partners/base-logo.svg" alt="" width={130} height={36} className="h-8 w-auto" />
              </a>
            </div>
            <p className="mt-4 max-w-md text-xs leading-relaxed text-zinc-600">
              Planning yield band {REFERENCE_YIELD_BAND_LABEL} p.a. · reference figures where marked — economics from issuer materials. Production on Base — contracts on{" "}
              <a href={baseExplorerBase} target="_blank" rel="noreferrer" className="text-zinc-500 hover:text-brand">
                Basescan
              </a>
              .{" "}
              <a href="/legal/risk" className="text-zinc-500 hover:text-brand">
                Legal
              </a>
              .
            </p>
          </div>

          <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:gap-x-8 lg:col-span-7 lg:grid-cols-4">
            <LinkCol title="Product" items={product} />
            <LinkCol title="Learn" items={learnColA} />
            <LinkCol title="Learn" items={learnColB} hideTitle />
            <LinkCol title="Legal" items={legal} />
          </div>
        </div>

        <div className="mt-10 flex flex-col gap-3 border-t border-white/[0.06] pt-8 text-center text-[11px] text-zinc-600 sm:flex-row sm:items-center sm:justify-between sm:text-left">
          <p>
            © {new Date().getFullYear()} Building Culture · Culture Land · Live on Base
          </p>
          <div className="flex flex-wrap justify-center gap-x-4 gap-y-2 sm:justify-end">
            <BetaNoticeTrigger
              className="inline-flex cursor-pointer items-center gap-1.5 text-zinc-600 underline-offset-4 hover:text-zinc-400 hover:underline"
              label={
                <span className="inline-flex items-center gap-1.5">
                  {footerIcons.beta}
                  Beta program
                </span>
              }
            />
            <Link href="/contracts" className="inline-flex items-center gap-1.5 hover:text-zinc-400">
              {footerIcons.verifyContracts}
              Verify contracts
            </Link>
            <a href={baseExplorerBase} target="_blank" rel="noreferrer" className="inline-flex items-center gap-1.5 hover:text-zinc-400">
              {footerIcons.external}
              Basescan
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
}
