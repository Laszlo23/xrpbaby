import { Link } from "@tanstack/react-router";
import type { LucideIcon } from "lucide-react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { motion } from "framer-motion";
import {
  footerCommunityLinks,
  footerCompanyLinks,
  footerContactMailto,
  footerEcosystemLinks,
  footerLayerLinks,
  footerLegalLinks,
  footerProductLinks,
  footerSocialLinks,
  footerStoryHashLinks,
  type ExternalFooterLink,
  type InternalFooterLink,
} from "@/lib/footer-links";
import { BRAND_DISPLAY_NAME } from "@/lib/brand";
import { LANDING_MEDIA } from "@/lib/landing-media";
import { getEcoHubLandingUrl } from "@/lib/hub-landing";

type FooterVariant = "story" | "product";

function FooterColumnTitle({ label, variant }: { label: string; variant: FooterVariant }) {
  const accent = variant === "story" ? "bg-[#C5FF41]/80" : "bg-neon/80 shadow-[0_0_10px_rgb(0_82_255/50%)]";
  return (
    <div className="mb-4 flex items-center gap-2.5">
      <span className={`h-1 w-1 rounded-full ${accent}`} aria-hidden />
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
  variant,
}: {
  to: string;
  hash?: string;
  children: React.ReactNode;
  icon: LucideIcon;
  variant: FooterVariant;
}) {
  const hoverIcon = variant === "story" ? "group-hover:text-[#00E5FF]" : "group-hover:text-neon";
  const className =
    "group flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100";

  if (hash) {
    return (
      <Link to={to} hash={hash} className={className}>
        <Icon className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors ${hoverIcon}`} strokeWidth={1.75} aria-hidden />
        <span>{children}</span>
      </Link>
    );
  }

  return (
    <Link to={to} className={className}>
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors ${hoverIcon}`} strokeWidth={1.75} aria-hidden />
      <span>{children}</span>
    </Link>
  );
}

function FooterExternalLink({
  href,
  label,
  Icon,
  variant,
}: {
  href: string;
  label: string;
  Icon: ExternalFooterLink["Icon"];
  variant: FooterVariant;
}) {
  const hoverIcon = variant === "story" ? "group-hover:text-[#00E5FF]" : "group-hover:text-neon";
  return (
    <a
      href={href}
      target="_blank"
      rel="noreferrer noopener"
      className="group flex items-start gap-3 rounded-lg px-2 py-2 -mx-2 text-sm text-zinc-400 transition-colors hover:bg-white/[0.05] hover:text-zinc-100"
    >
      <Icon className={`mt-0.5 h-4 w-4 shrink-0 text-zinc-600 transition-colors ${hoverIcon}`} aria-hidden />
      <span className="flex items-center gap-1">
        {label}
        <ArrowUpRight size={12} className="opacity-60" aria-hidden />
      </span>
    </a>
  );
}

function renderInternalLink(item: InternalFooterLink, variant: FooterVariant) {
  const key = `${item.label}-${item.to}-${item.hash ?? ""}`;
  return (
    <li key={key}>
      <FooterLinkRow to={item.to} hash={item.hash} icon={item.icon} variant={variant}>
        {item.label}
      </FooterLinkRow>
    </li>
  );
}

type AppFooterProps = {
  variant?: FooterVariant;
  /** When true, add safe-area padding for bottom nav */
  withBottomNav?: boolean;
};

export function AppFooter({ variant = "product", withBottomNav = false }: AppFooterProps) {
  const year = new Date().getFullYear();
  const ecoHubUrl = getEcoHubLandingUrl();
  const isStory = variant === "story";

  const shellClass = isStory
    ? "relative border-t border-white/5 bg-[#050505] py-16"
    : `relative border-t border-white/[0.07] bg-gradient-to-b from-black/50 via-black/40 to-black/55 pt-16 backdrop-blur-md ${withBottomNav ? "pb-nav-safe" : "pb-12"}`;

  return (
    <footer className={shellClass}>
      {!isStory ? (
        <>
          <div
            className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[rgb(0_82_255/35%)] to-transparent"
            aria-hidden
          />
          <div className="pointer-events-none absolute -left-24 top-20 h-48 w-48 rounded-full bg-neon/[0.06] blur-3xl" aria-hidden />
        </>
      ) : null}

      <div className={`relative mx-auto max-w-7xl px-5 sm:px-8 ${isStory ? "" : "max-w-6xl sm:px-6 md:px-10"}`}>
        {isStory ? (
          <div className="mb-12 flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
            <motion.div>
              <div className="flex items-center gap-2.5">
                <img
                  src={LANDING_MEDIA.logo}
                  alt="Building Culture"
                  className="h-8 w-auto object-contain"
                  width={32}
                  height={32}
                />
                <span className="font-display text-lg font-bold tracking-tight text-white">
                  Building Culture
                </span>
              </div>
              <p className="mt-4 max-w-md text-sm leading-relaxed text-zinc-400">
                A new way to fund, build, own and experience real-world communities. Not through
                banks. Through people.
              </p>
            </motion.div>
          </div>
        ) : null}

        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-5 lg:gap-8">
          <div>
            <FooterColumnTitle label="Product" variant={variant} />
            <ul className="space-y-1">{footerProductLinks.map((item) => renderInternalLink(item, variant))}</ul>
          </div>
          <div>
            <FooterColumnTitle label="Ecosystem" variant={variant} />
            <ul className="space-y-1">
              {footerEcosystemLinks.map((item) => {
                const external = item.href.startsWith("http");
                if (external) {
                  return (
                    <li key={item.href}>
                      <FooterExternalLink href={item.href} label={item.label} Icon={item.icon} variant={variant} />
                    </li>
                  );
                }
                return (
                  <li key={item.href}>
                    <FooterLinkRow to={item.href} icon={item.icon} variant={variant}>
                      {item.label}
                    </FooterLinkRow>
                  </li>
                );
              })}
            </ul>
          </div>
          <div>
            <FooterColumnTitle label="Layers" variant={variant} />
            <ul className="space-y-1">{footerLayerLinks.map((item) => renderInternalLink(item, variant))}</ul>
            {isStory ? (
              <ul className="mt-4 space-y-1">
                {footerStoryHashLinks.map((item) => (
                  <li key={item.hash}>
                    <FooterLinkRow to="/" hash={item.hash} icon={item.icon} variant={variant}>
                      {item.label}
                    </FooterLinkRow>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
          <div>
            <FooterColumnTitle label="Community" variant={variant} />
            <ul className="space-y-1">
              {footerCommunityLinks.map((item) => renderInternalLink(item, variant))}
              {footerSocialLinks().slice(0, 4).map((s) => (
                <li key={s.href}>
                  <FooterExternalLink href={s.href} label={s.label} Icon={s.Icon} variant={variant} />
                </li>
              ))}
            </ul>
          </div>
          <div>
            <FooterColumnTitle label="Company" variant={variant} />
            <ul className="space-y-1">
              {footerCompanyLinks.map((item) => (
                <li key={item.to}>
                  <FooterLinkRow to={item.to} icon={item.icon} variant={variant}>
                    {item.label}
                  </FooterLinkRow>
                </li>
              ))}
              {ecoHubUrl ? (
                <li>
                  <FooterExternalLink href={ecoHubUrl} label="Revival & hubs" Icon={BookOpen} variant={variant} />
                </li>
              ) : null}
              <li>
                <FooterExternalLink href={footerContactMailto} label="Contact" Icon={BookOpen} variant={variant} />
              </li>
            </ul>
            <div className="mt-6">
              <FooterColumnTitle label="Legal" variant={variant} />
              <ul className="space-y-1">
                {footerLegalLinks.map((item) => (
                  <li key={item.to}>
                    <FooterLinkRow to={item.to} icon={item.icon} variant={variant}>
                      {item.label}
                    </FooterLinkRow>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <div className="mt-12 flex flex-col gap-4 border-t border-white/[0.08] pt-8 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-xs text-zinc-500">
            © {year} {BRAND_DISPLAY_NAME} — BUILT BY PEOPLE.
          </p>
          <p className="text-xs text-zinc-500">Vienna · Austria · Worldwide · Not financial advice.</p>
        </div>
      </div>
    </footer>
  );
}

/** @deprecated Use AppFooter */
export function SiteFooter() {
  return <AppFooter variant="product" withBottomNav />;
}
