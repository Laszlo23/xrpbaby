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

export const LANDING_ECOSYSTEM: LandingEcosystemApp[] = [
  {
    id: "bc-capital",
    name: "Building Culture Capital",
    description:
      "The home of the movement. Learn about the vision, community, properties and future of Building Culture.",
    tag: "Vision Platform",
    status: "beta",
    layer: "vision",
    externalUrl: "https://buildingculture.capital",
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
    externalUrl: "https://home.buildingculture.capital",
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
    id: "bc-game",
    name: "Building Culture Game",
    description:
      "Learn, explore and engage through gamified experiences that reward participation.",
    tag: "Engagement Layer",
    status: "beta",
    layer: "engagement",
    externalUrl: "https://game.buildingculture.capital",
  },
  {
    id: "bc-miniapp",
    name: "Building Culture MiniApp",
    description:
      "The gateway for new users. Simple onboarding. Community rewards. Tasks. XP. Achievements. Future token claims.",
    tag: "Growth Engine",
    status: "coming-soon",
    layer: "growth",
    href: "/forest",
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
    name: "Culture Dollar (BCD)",
    description: "Community credits — earn, hold, and use with care.",
    tag: "Community credits",
    status: "beta",
    layer: "core",
    href: "/mission",
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
];

export function ecosystemLink(app: LandingEcosystemApp): string | undefined {
  return app.href ?? app.externalUrl ?? undefined;
}

export function isExternalEcosystemLink(app: LandingEcosystemApp): boolean {
  return !app.href && Boolean(app.externalUrl);
}
