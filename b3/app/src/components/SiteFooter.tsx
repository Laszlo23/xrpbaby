import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Building2,
  Compass,
  Cookie,
  FileText,
  Flag,
  Globe,
  HelpCircle,
  Home,
  Info,
  Landmark,
  Layers,
  MapPin,
  PieChart,
  Rocket,
  Shield,
  Sparkles,
  Trophy,
  UserCircle,
  Users,
  Workflow,
  Zap,
  Gem,
} from "lucide-react";
import type { ComponentType } from "react";
import { FaDiscord, FaTelegram } from "react-icons/fa";
import { FaXTwitter } from "react-icons/fa6";
import { SiFarcaster } from "react-icons/si";
import {
  communityTelegramUrl,
  communityXUrl,
  farcasterFollowProfileUrl,
} from "@/lib/community-links";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { getEcoHubLandingUrl } from "@/lib/hub-landing";

type InternalFooterLink =
  | {
      to: "/";
      label: string;
      icon: LucideIcon;
      hash?: "drops" | "community";
    }
  | {
      to: string;
      label: string;
      icon: LucideIcon;
      hash?: undefined;
    };

const productLinks: InternalFooterLink[] = [
  { to: "/", label: "Home", icon: Home },
  { to: "/", hash: "drops", label: "Drops", icon: Sparkles },
  { to: "/collections", label: "Collections", icon: Layers },
  { to: "/marketplace", label: "Marketplace", icon: Building2 },
  { to: "/campaign", label: "Campaign", icon: Rocket },
  { to: "/elias", label: "Elias Concierge", icon: Gem },
  { to: "/agent-fleet", label: "Agent fleet", icon: Workflow },
];

const companyLinks: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/guide", label: "Sites guide", icon: Compass },
  { to: "/about", label: "About", icon: Info },
  { to: "/team", label: "Team", icon: Users },
  { to: "/mission", label: "Mission (BCD)", icon: Flag },
  { to: "/investors", label: "Investors", icon: PieChart },
  { to: "/roadmap", label: "Roadmap", icon: MapPin },
  { to: "/experiences", label: "Experiences", icon: Globe },
  { to: "/blog", label: "Blog", icon: BookOpen },
  { to: "/faq", label: "FAQ", icon: HelpCircle },
];

const legalLinks: { to: string; label: string; icon: LucideIcon }[] = [
  { to: "/legal/terms", label: "Terms", icon: FileText },
  { to: "/legal/privacy", label: "Privacy", icon: Shield },
  { to: "/legal/imprint", label: "Imprint", icon: Landmark },
  { to: "/legal/cookies", label: "Cookies", icon: Cookie },
];

const communityInternalLinks: InternalFooterLink[] = [
  { to: "/mission", label: "Building Culture Mission", icon: Rocket },
  { to: "/genesis-district", label: "Genesis District (Phase 0)", icon: Gem },
  { to: "/", hash: "community", label: "Community hub (home)", icon: Users },
  { to: "/leaderboard", label: "Leaderboard", icon: Trophy },
  { to: "/experiences", label: "Experiences", icon: Zap },
  { to: "/profile", label: "Builder profile", icon: UserCircle },
];

type ExternalSocialLink = {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
};

function externalCommunityLinks(): ExternalSocialLink[] {
  const discord = import.meta.env.VITE_COMMUNITY_DISCORD_URL as string | undefined;
  const out: ExternalSocialLink[] = [];
  if (discord?.trim()) out.push({ href: discord.trim(), label: "Discord", Icon: FaDiscord });
  out.push({ href: communityXUrl(), label: "X — @buildingcultu3", Icon: FaXTwitter });
  out.push({ href: communityTelegramUrl(), label: "Telegram — BuildingCulture", Icon: FaTelegram });
  out.push({
    href: farcasterFollowProfileUrl(),
    label: "Farcaster — @0xleonardo",
    Icon: SiFarcaster,
  });
  return out;
}

function FooterColumnTitle({ label }: { label: string }) {
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span
        className="h-1 w-1 rounded-full bg-neon/80 shadow-[0_0_10px_rgb(0_82_255/50%)]"
        aria-hidden
      />
      <p className="font-mono text-[11px] font-medium uppercase tracking-[0.22em] text-zinc-500">
        {label}
      </p>
    </div>
  );
}

function FooterLinkRow({
  to,
  hash,
  children,
  icon: Icon,
}: {
  to: string;
  hash?: "drops" | "community";
  children: React.ReactNode;
  icon: LucideIcon;
}) {
  const className =
    "group flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100";

  if (hash) {
    return (
      <Link to={to} hash={hash} className={className}>
        <Icon
          className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-neon"
          strokeWidth={1.75}
          aria-hidden
        />
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <Link to={to} className={className}>
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-neon"
        strokeWidth={1.75}
        aria-hidden
      />
      <span>{children}</span>
    </Link>
  );
}

function FooterExternalLink({
  href,
  label,
  Icon,
}: {
  href: string;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
    >
      <Icon
        className="mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors group-hover:text-neon"
        aria-hidden
      />
      <span className="flex items-center gap-1">
        {label}
        <span className="text-[10px] font-normal text-zinc-600 group-hover:text-zinc-500">↗</span>
      </span>
    </a>
  );
}

export function SiteFooter() {
  const year = new Date().getFullYear();
  const externalSocial = externalCommunityLinks();
  const ecoHubUrl = getEcoHubLandingUrl();

  return (
    <footer className="relative border-t border-white/[0.07] bg-gradient-to-b from-black/50 via-black/40 to-black/55 pb-nav-safe pt-16 backdrop-blur-md">
      <div
        className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(0_82_255/35%)] to-transparent"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -left-24 top-20 h-48 w-48 rounded-full bg-neon/[0.06] blur-3xl"
        aria-hidden
      />
      <div
        className="pointer-events-none absolute -right-16 bottom-24 h-40 w-40 rounded-full bg-emerald-500/[0.05] blur-3xl"
        aria-hidden
      />

      <div className="relative mx-auto flex max-w-6xl flex-col gap-12 px-4 sm:px-6 md:px-10">
        <div className="grid gap-12 sm:grid-cols-2 lg:grid-cols-4 lg:gap-10">
          <div>
            <FooterColumnTitle label="Product" />
            <ul className="space-y-1">
              {productLinks.map((item) => (
                <li key={`${item.label}-${item.to}-${"hash" in item ? (item.hash ?? "") : ""}`}>
                  {"hash" in item && item.hash ? (
                    <FooterLinkRow to={item.to} hash={item.hash} icon={item.icon}>
                      {item.label}
                    </FooterLinkRow>
                  ) : (
                    <FooterLinkRow to={item.to} icon={item.icon}>
                      {item.label}
                    </FooterLinkRow>
                  )}
                </li>
              ))}
            </ul>
          </div>
          <div>
            <FooterColumnTitle label="Community" />
            <ul className="space-y-1">
              {communityInternalLinks.map((item) => (
                <li key={`${item.label}-${item.to}-${"hash" in item ? (item.hash ?? "") : ""}`}>
                  {"hash" in item && item.hash ? (
                    <FooterLinkRow to={item.to} hash={item.hash} icon={item.icon}>
                      {item.label}
                    </FooterLinkRow>
                  ) : (
                    <FooterLinkRow to={item.to} icon={item.icon}>
                      {item.label}
                    </FooterLinkRow>
                  )}
                </li>
              ))}
              {externalSocial.map((s) => (
                <li key={s.href}>
                  <FooterExternalLink href={s.href} label={s.label} Icon={s.Icon} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <FooterColumnTitle label="Company" />
            <ul className="space-y-1">
              {companyLinks.map((item) => (
                <li key={item.to}>
                  <FooterLinkRow to={item.to} icon={item.icon}>
                    {item.label}
                  </FooterLinkRow>
                </li>
              ))}
              {ecoHubUrl ? (
                <li>
                  <FooterExternalLink href={ecoHubUrl} label="Revival & hubs (AT)" Icon={MapPin} />
                </li>
              ) : null}
            </ul>
          </div>
          <div>
            <FooterColumnTitle label="Legal" />
            <ul className="space-y-1">
              {legalLinks.map((item) => (
                <li key={item.to}>
                  <FooterLinkRow to={item.to} icon={item.icon}>
                    {item.label}
                  </FooterLinkRow>
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="flex flex-col gap-4 border-t border-white/[0.08] pt-10 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl border border-white/[0.08] bg-white/[0.04] shadow-[0_0_24px_-8px_rgb(0_82_255/40%)]">
              <BookOpen className="h-4 w-4 text-neon" strokeWidth={1.75} aria-hidden />
            </span>
            <div>
              <p className="font-heading text-sm font-semibold tracking-tight text-zinc-200">
                {BRAND_DISPLAY_NAME}
              </p>
              <p className="font-mono text-[10px] uppercase tracking-[0.2em] text-zinc-600">
                Onchain RWA builder
              </p>
            </div>
          </div>
          <p className="max-w-md font-mono text-[11px] leading-relaxed text-zinc-600 sm:text-right">
            © {year} {BRAND_DISPLAY_NAME}. Not financial advice. Drops involve risk.
          </p>
        </div>
      </div>
    </footer>
  );
}
