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
    label: "Campaign Hub",
    href: "/play",
    hint: "Tickets, campaigns, live pools — social impact and fundraising.",
  },
  {
    id: "campaign_hub",
    label: "Campaign Hub",
    href: "/products/campaign-hub",
    hint: "Product page — create and support community campaigns.",
  },
  {
    id: "culture_id",
    label: "Building Culture ID",
    href: "/products/culture-id",
    hint: "Portable Web3 reputation — proof of contribution and credentials.",
  },
  {
    id: "ai_agents",
    label: "AI Agents",
    href: "/products/ai-agents",
    hint: "Community-powered AI workforce — grant, marketing, research agents.",
  },
  {
    id: "grant_proof",
    label: "Grant Proof",
    href: "/products/grant-proof",
    hint: "Transparent proof of impact for grants and milestones.",
  },
  {
    id: "mission",
    label: "Mission & $BCC",
    href: "/mission",
    hint: "Culture Coin, genesis claim, long-horizon build.",
  },
  {
    id: "builder_story",
    label: "Builder chronicle",
    href: "/story",
    hint: "From Web2 to Building Culture — essays on Paragraph, timeline since 1996.",
  },
  {
    id: "liquidity",
    label: "Learn BCC liquidity",
    href: "/liquidity",
    hint: "Uniswap + Aerodrome pools, lesson track, Culture Points.",
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
    label: "Building Culture ID",
    href: "/pass",
    hint: "Identity and portable reputation across the platform.",
  },
  {
    id: "bcdai",
    label: "BCDAI trading terminal",
    absoluteUrl: "https://bcdai.buildingcultureid.space/",
    hint: "AI copilots, copy trading, and MEV-aware routing on Base & Solana.",
  },
  {
    id: "ankommen",
    label: "Ankommen AI",
    absoluteUrl: "https://ankommen.buildingcultureid.space/",
    hint: "Austria newcomer companion — housing, benefits, documents, jobs (guidance only).",
  },
  {
    id: "forkids",
    label: "KinderStimme (For Kids)",
    absoluteUrl: "https://forkids.buildingcultureid.space/",
    hint: "Child protection protocol — AI guidance and encrypted evidence vault (not legal advice).",
  },
  {
    id: "telegram_arcade",
    label: "Telegram Community Arcade",
    href: "/tg",
    hint: "Daily tap-in, fun missions, TG leaderboard via @buildingcultureappbot.",
  },
  {
    id: "bc_studio",
    label: "BC Studio",
    href: "/studio",
    hint: "AI app builder — chat, preview, export, publish (builders with Build intent).",
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
    label: "Campaign Hub",
    href: "/play",
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
  {
    id: "culture_atlas",
    label: "Culture Atlas",
    absoluteUrl: "https://buildingcultureid.space/demo/atlas/",
    hint: "Living cultural archives — explore, collect editions, submit Culture Voices.",
  },
  {
    id: "creators",
    label: "Creators hub",
    href: "/creators",
    hint: "Artists, musicians, storytellers — apply to contribute to Culture Atlas.",
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
