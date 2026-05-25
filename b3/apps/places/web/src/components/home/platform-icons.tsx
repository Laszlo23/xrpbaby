import type { ReactNode } from "react";

/** Shared line icons for platform ecosystem cards (match Nav visual language). */
export const PlatformIcon = {
  properties: (cls: string) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M3 21h18M5 21V7l7-4 7 4v14M9 21v-4h6v4M9 11h.01M12 11h.01M15 11h.01" strokeLinecap="round" />
    </svg>
  ),
  invest: (cls: string) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" strokeLinecap="round" />
    </svg>
  ),
  trade: (cls: string) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M7 16V4m0 0L3 8m4-4 4 4M17 8v12m0 0 4-4m-4 4-4-4" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  stake: (cls: string) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" strokeLinejoin="round" />
    </svg>
  ),
  portfolio: (cls: string) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <rect x="3" y="3" width="7" height="18" rx="1" />
      <rect x="14" y="9" width="7" height="12" rx="1" />
    </svg>
  ),
  pool: (cls: string) => (
    <svg className={cls} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.75" aria-hidden>
      <path
        d="M12 2.5c-3 4-6 7.5-6 11a6 6 0 0 0 12 0c0-3.5-3-7-6-11z"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  ),
};

export type PlatformLinkItem = {
  href: string;
  title: string;
  description: string;
  icon: (cls: string) => ReactNode;
};

export const PLATFORM_LINKS: PlatformLinkItem[] = [
  {
    href: "/properties",
    title: "Properties",
    description: "Browse fractional listings and on-chain share tokens.",
    icon: PlatformIcon.properties,
  },
  {
    href: "/invest",
    title: "Invest",
    description: "Buy fractional property tokens from the community.",
    icon: PlatformIcon.invest,
  },
  {
    href: "/trade",
    title: "Trade",
    description: "Swap OG for property shares when pools exist.",
    icon: PlatformIcon.trade,
  },
  {
    href: "/stake",
    title: "Stake",
    description: "Stake OG for protocol rewards where configured.",
    icon: PlatformIcon.stake,
  },
  {
    href: "/portfolio",
    title: "Portfolio",
    description: "Track holdings, allocation, and positions.",
    icon: PlatformIcon.portfolio,
  },
  {
    href: "/pool",
    title: "Liquidity pools",
    description: "Add liquidity and earn trading fees on the AMM.",
    icon: PlatformIcon.pool,
  },
];
