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
    id: "welcome",
    label: "Our story",
    href: "/",
    hint: "Mission, ecosystem, and vision — start here for new people.",
  },
  {
    id: "join",
    label: "Create your pass",
    href: "/join",
    hint: "Smart wallet onboarding — one step into the community.",
  },
  {
    id: "forest",
    label: "Community hub",
    href: "/forest",
    hint: "Quests, modules, and Culture Points in one place.",
  },
  {
    id: "app_home",
    label: "Drops home",
    href: "/play",
    hint: "Tickets, campaigns, live pools.",
  },
  {
    id: "mission",
    label: "Mission & BCD",
    href: "/mission",
    hint: "Culture Dollar, genesis claim, long-horizon build.",
  },
  {
    id: "community_guide",
    label: "Community guide",
    href: "/guide",
    hint: "Plain-language explainer for the whole platform.",
  },
  {
    id: "earth",
    label: "Earth & hubs",
    href: "/earth",
    hint: "Eco lane — regeneration and physical hubs.",
  },
  {
    id: "pass",
    label: "Culture pass",
    href: "/pass",
    hint: "Identity across the platform.",
  },
  {
    id: "faq",
    label: "FAQ",
    href: "/faq",
    hint: "How tickets, payouts, and rewards work.",
  },
  {
    id: "profile",
    label: "Profile & Culture Points",
    href: "/profile",
    hint: "Quests, streaks, badges.",
  },
  {
    id: "marketplace",
    label: "Marketplace",
    href: "/marketplace",
    hint: "Listings & secondary stories.",
  },
  {
    id: "campaigns",
    label: "Drops hub",
    href: "/campaigns",
    hint: "Active mints / ticket pools.",
  },
  {
    id: "elias_concierge",
    label: "Elias concierge",
    href: "/elias",
    hint: "Vienna planning + partner approvals.",
  },
  {
    id: "onboarding_host",
    label: "Marketing front door",
    href: "/",
    hint: "Story landing at the app root.",
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
