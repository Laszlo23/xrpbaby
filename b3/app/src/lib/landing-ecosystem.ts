import { identityMintPriceShort } from "@/lib/identity/mint-price";

export type EcosystemStatus = "live" | "beta" | "coming-soon";

export type LandingEcosystemApp = {
  id: string;
  name: string;
  description: string;
  tag: string;
  status: EcosystemStatus;
  layer: string;
  /** In-app route when unified on this host */
  href?: string;
  /** External URL when not yet unified */
  externalUrl?: string;
};

/** Primary trio for first-time visitors — Play, Pass, Places. */
export const PRIMARY_STARTER_APPS: LandingEcosystemApp[] = [
  {
    id: "bc-app",
    name: "Play",
    description:
      "Fair drops and raffle tickets for real stays, art, and culture — the main member loop.",
    tag: "Start here",
    status: "live",
    layer: "core",
    href: "/play",
  },
  {
    id: "bc-id",
    name: "Culture Pass",
    description: `Claim your .culture name on Base — ${identityMintPriceShort}.`,
    tag: "Identity",
    status: "live",
    layer: "identity",
    href: "/pass",
  },
  {
    id: "bc-places",
    name: "Places",
    description:
      "Community-funded real estate — compliance-gated investor journeys and RWA rails.",
    tag: "Invest",
    status: "beta",
    layer: "living",
    href: "/places",
  },
];

export const LANDING_ECOSYSTEM: LandingEcosystemApp[] = [
  {
    id: "bc-capital",
    name: "Building Culture Capital",
    description:
      "The home of the movement. Learn about the vision, community, properties and future of Building Culture.",
    tag: "Vision Platform",
    status: "beta",
    layer: "vision",
    externalUrl: "https://app.buildingcultureid.space",
  },
  {
    id: "bc-app",
    name: "Building Culture App",
    description:
      "The operating system of Building Culture. Manage assets, participate in opportunities, explore projects.",
    tag: "Core Platform",
    status: "beta",
    layer: "core",
    href: "/play",
  },
  {
    id: "bc-home",
    name: "Building Culture Home",
    description:
      "Discover homes, properties and future living opportunities powered by community and technology.",
    tag: "Living Platform",
    status: "beta",
    layer: "living",
    externalUrl: "https://home.buildingcultureid.space",
  },
  {
    id: "bc-id",
    name: "Building Culture ID",
    description: `Claim your .culture name on Base — ${identityMintPriceShort}.`,
    tag: "Identity Layer",
    status: "live",
    layer: "identity",
    href: "/pass",
  },
  {
    id: "bc-art",
    name: "Building Culture Art",
    description:
      "A place for real artwork, digital collectibles, cultural storytelling, and future onchain art experiences.",
    tag: "Art & Culture Layer",
    status: "live",
    layer: "art",
    href: "/drops/art",
  },
  {
    id: "wohnai",
    name: "WohnAI",
    description:
      "The AI real estate agent for Vienna and Austria. Find rentals, homes, investments via a ChatGPT-like interface.",
    tag: "AI Real Estate Agent",
    status: "live",
    layer: "ai",
    externalUrl: "https://wohnai.buildingcultureid.space/",
  },
  {
    id: "bcdai",
    name: "BCDAI",
    description:
      "Autonomous crypto OS — AI copilots, copy trading, visual IF/THEN rules, and MEV-aware routing on Base & Solana.",
    tag: "AI Trading Terminal",
    status: "live",
    layer: "ai",
    externalUrl: "https://bcdai.buildingcultureid.space/",
  },
  {
    id: "bc-game",
    name: "Building Culture Game",
    description:
      "Learn, explore and engage through gamified experiences that reward participation.",
    tag: "Engagement Layer",
    status: "beta",
    layer: "engagement",
    externalUrl: "https://game.buildingcultureid.space",
  },
  {
    id: "bc-miniapp",
    name: "Building Culture MiniApp",
    description:
      "Telegram Community Arcade — daily tap-in, fun missions, leaderboard. One person. One block.",
    tag: "Growth Engine",
    status: "live",
    layer: "growth",
    href: "/tg",
  },
  {
    id: "ankommen",
    name: "Ankommen AI",
    description:
      "AI companion for newcomers in Austria — housing, benefits, documents, jobs, and translation in 14 languages.",
    tag: "Social Impact / AI",
    status: "beta",
    layer: "impact",
    externalUrl: "https://ankommen.buildingcultureid.space",
  },
  {
    id: "forkids",
    name: "KinderStimme (For Kids)",
    description:
      "Open Child Protection Protocol — AI guidance, encrypted evidence vault, and family collaboration for Austrian proceedings.",
    tag: "Social Impact / AI",
    status: "beta",
    layer: "impact",
    externalUrl: "https://forkids.buildingcultureid.space",
  },
  {
    id: "bc-studio",
    name: "BC Studio",
    description:
      "Build and ship web apps with AI — chat, live preview, export, and publish to Building Culture subdomains.",
    tag: "Creation Tool",
    status: "beta",
    layer: "builder",
    href: "/studio",
  },
];

/** In-app community hub modules (subset + platform lanes) */
export const COMMUNITY_MODULES: LandingEcosystemApp[] = [
  {
    id: "community-hub",
    name: "Culture Pulse",
    description: "Transparent growth, social streams, and daily attestation.",
    tag: "Live signal",
    status: "live",
    layer: "core",
    href: "/signal",
  },
  {
    id: "profile",
    name: "Your profile",
    description: "Culture Points, streaks, quests, and badges.",
    tag: "Identity",
    status: "live",
    layer: "identity",
    href: "/profile",
  },
  {
    id: "bcd",
    name: "Culture Coin (BCC)",
    description: "Community credits — earn, hold, and use with care.",
    tag: "Community credits",
    status: "beta",
    layer: "core",
    href: "/mission",
  },
  {
    id: "bcc-liquidity",
    name: "Learn BCC liquidity",
    description: "Pools on Uniswap and Aerodrome — lessons, LP guides, Culture Points.",
    tag: "Education",
    status: "live",
    layer: "core",
    href: "/liquidity",
  },
  {
    id: "founding",
    name: "Founding quests",
    description: "Early supporters grow faster — play, earn, belong.",
    tag: "Engagement",
    status: "live",
    layer: "engagement",
    href: "/forest/quests",
  },
  {
    id: "earth",
    name: "Earth & hubs",
    description: "Regeneration, eco revival, and real places.",
    tag: "Living Platform",
    status: "beta",
    layer: "living",
    href: "/earth",
  },
  {
    id: "pass",
    name: "Culture pass",
    description: `Claim your .culture name on Base — ${identityMintPriceShort} at mint.`,
    tag: "Identity",
    status: "live",
    layer: "identity",
    href: "/pass",
  },
  {
    id: "art",
    name: "Art drops",
    description: "Real artwork, cultural stories, and shared raffles.",
    tag: "Art & culture",
    status: "live",
    layer: "art",
    href: "/drops/art",
  },
  {
    id: "places",
    name: "Places",
    description: "Thoughtful real-estate journeys — with clear disclaimers.",
    tag: "Places",
    status: "beta",
    layer: "living",
    href: "/places",
  },
  {
    id: "ankommen",
    name: "Ankommen AI",
    description: "Newcomer companion for Austria — benefits, housing, documents, jobs.",
    tag: "Social impact",
    status: "beta",
    layer: "impact",
    externalUrl: "https://ankommen.buildingcultureid.space",
  },
  {
    id: "forkids",
    name: "KinderStimme",
    description: "Child protection protocol — AI guidance and encrypted evidence vault.",
    tag: "Social impact",
    status: "beta",
    layer: "impact",
    externalUrl: "https://forkids.buildingcultureid.space",
  },
  {
    id: "bc-studio",
    name: "BC Studio",
    description: "AI app builder — preview in sandbox, export or publish.",
    tag: "Builder",
    status: "beta",
    layer: "builder",
    href: "/studio",
  },
];

export function ecosystemLink(app: LandingEcosystemApp): string | undefined {
  return app.href ?? app.externalUrl ?? undefined;
}

export function isExternalEcosystemLink(app: LandingEcosystemApp): boolean {
  return !app.href && Boolean(app.externalUrl);
}
