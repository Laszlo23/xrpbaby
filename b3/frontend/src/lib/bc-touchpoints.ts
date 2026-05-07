/**
 * Canonical Building Culture URLs and in-app routes.
 * Sources for Elias replies + UI deep links — avoids inconsistent marketing URLs.
 */

export type BcTouchpoint = {
  id: string;
  label: string;
  /** In-app path (TanStack Router) — leading slash */
  href?: string;
  /** Trusted external hubs */
  absoluteUrl?: string;
  hint: string;
};

export const BC_TOUCHPOINTS: BcTouchpoint[] = [
  {
    id: "app_home",
    label: "App home",
    href: "/",
    hint: "Drops, hero story, treasury of culture plays.",
  },
  {
    id: "mission",
    label: "Mission & genesis",
    href: "/mission",
    hint: "DAO narrative, genesis BCD claim, long-horizon build.",
  },
  {
    id: "faq",
    label: "FAQ",
    href: "/faq",
    hint: "How tickets, payouts, and on-chain pieces work.",
  },
  {
    id: "profile",
    label: "Profile & XP",
    href: "/profile",
    hint: "Quests, daily streak framing, badges.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    href: "/marketplace",
    hint: "Listings & secondary liquidity stories.",
  },
  {
    id: "campaigns",
    label: "Drops hub",
    href: "/campaigns",
    hint: "Active mints / ticket pools.",
  },
  {
    id: "elias_concierge",
    label: "Elias concierge (full)",
    href: "/elias",
    hint: "Vienna itinerary planning + partner approvals — full workflow.",
  },
  {
    id: "capital",
    label: "Building Culture Capital",
    absoluteUrl: "https://buildingculture.capital/",
    hint: "Capital / fundraise-facing narrative.",
  },
  {
    id: "zero_x",
    label: "0x BuildingCulture",
    absoluteUrl: "https://0x.buildingculture.capital/",
    hint: "Token / positioning layer.",
  },
  {
    id: "eco",
    label: "Building Culture Eco hub",
    absoluteUrl: "https://eco.buildingculture.capital/",
    hint: "Ecosystem + sustainability threads.",
  },
  {
    id: "production_app",
    label: "Production app",
    absoluteUrl: "https://app.buildingculture.capital/",
    hint: "Primary shipped app hostname.",
  },
];

/** Compact block for prompts (newline-separated). */
export function formatTouchpointsForPrompt(max = 22): string {
  return BC_TOUCHPOINTS.slice(0, max)
    .map((t) => {
      const path = t.href ?? t.absoluteUrl ?? "";
      return `- ${t.id}: ${t.label} — ${path} — ${t.hint}`;
    })
    .join("\n");
}
