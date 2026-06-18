import { Brain, Coins, Fingerprint, ShoppingBag, Users, type LucideIcon } from "lucide-react";

export type CultureLayerId = "community" | "identity" | "agents" | "economy" | "capital";

export type CultureLayerSubItem = {
  id: string;
  label: string;
  description: string;
  href: string;
  external?: boolean;
};

export type CultureLayer = {
  id: CultureLayerId;
  number: 1 | 2 | 3 | 4 | 5;
  label: string;
  headline: string;
  color: string;
  icon: LucideIcon;
  subItems: CultureLayerSubItem[];
};

export const DEFAULT_CULTURE_LAYER_ID: CultureLayerId = "community";

export const CULTURE_LAYERS: CultureLayer[] = [
  {
    id: "community",
    number: 1,
    label: "Community",
    headline: "Belong to people, stories, projects, and places.",
    color: "#00E5FF",
    icon: Users,
    subItems: [
      {
        id: "people",
        label: "People",
        description: "Meet the builders, founders, and operators behind the culture.",
        href: "/team",
      },
      {
        id: "stories",
        label: "Stories",
        description: "Real journeys from builders who earned trust onchain.",
        href: "#stories",
      },
      {
        id: "projects",
        label: "Projects",
        description: "Ship proof pages, campaigns, and culture artifacts in BC Studio.",
        href: "/studio",
      },
      {
        id: "places",
        label: "Places",
        description: "Real homes and spaces with compliance-gated investor journeys.",
        href: "/places",
      },
    ],
  },
  {
    id: "identity",
    number: 2,
    label: "Identity",
    headline: "Your onchain profile. Reputation that travels.",
    color: "#C5FF41",
    icon: Fingerprint,
    subItems: [
      {
        id: "culture-name",
        label: ".culture",
        description: "Mint your Building Culture name — your anchor across the stack.",
        href: "/pass",
      },
      {
        id: "credentials",
        label: "Credentials",
        description: "Verifiable proof — builder, contributor, human, agent, and project credentials.",
        href: "/credentials",
      },
      {
        id: "culture-reputation",
        label: "Culture Reputation",
        description: "Weighted trust score from credentials, contributions, and verified signals.",
        href: "/id/laszlo.culture/reputation",
      },
      {
        id: "linked-wallets",
        label: "Linked wallets",
        description: "Connect EVM, XRPL, and other wallets to your Culture ID.",
        href: "/pass",
      },
    ],
  },
  {
    id: "agents",
    number: 3,
    label: "Agents",
    headline: "AI agents that research, market, grant, and build alongside you.",
    color: "#00E5FF",
    icon: Brain,
    subItems: [
      {
        id: "research-agent",
        label: "Research Agent",
        description: "Web3, AI, ecosystem, and competitor research — live via x402.",
        href: "/agent-os",
      },
      {
        id: "marketing-agent",
        label: "Marketing Agent",
        description: "Social, campaigns, and onchain marketing powered by Grove.",
        href: "/agent-os",
      },
      {
        id: "grant-agent",
        label: "Grant Agent",
        description: "Grant-ready proof pages and application drafts.",
        href: "/grant-proof",
      },
      {
        id: "builder-agent",
        label: "Builder Agent",
        description: "Ship projects, pages, and proof artifacts in BC Studio.",
        href: "/studio",
      },
    ],
  },
  {
    id: "economy",
    number: 4,
    label: "Economy",
    headline: "Marketplace, services, and creator rails for culture builders.",
    color: "#C47C59",
    icon: ShoppingBag,
    subItems: [
      {
        id: "marketplace",
        label: "Marketplace",
        description: "List and discover culture goods, drops, and builder offerings.",
        href: "/marketplace",
      },
      {
        id: "services",
        label: "Services",
        description: "Paid agent services — research, content, and growth on demand.",
        href: "/agent-os",
      },
      {
        id: "creator-economy",
        label: "Creator Economy",
        description: "Culture Atlas, art drops, and creator monetization rails.",
        href: "/creators",
      },
    ],
  },
  {
    id: "capital",
    number: 5,
    label: "Capital",
    headline: "BCC, treasury, and agent shares — transparent value flow.",
    color: "#839788",
    icon: Coins,
    subItems: [
      {
        id: "bcc-token",
        label: "BCC Token",
        description: "Building Culture Coin — utility across mints, discounts, and settlement.",
        href: "/bcc",
      },
      {
        id: "treasury",
        label: "Treasury",
        description: "Treasury dashboard, fee routing, and ecosystem settlement.",
        href: "/bcc/dashboard",
      },
      {
        id: "agent-shares",
        label: "Agent Shares",
        description: "Onchain agent share NFTs with treasury and liquidity splits.",
        href: "/campaign",
      },
    ],
  },
];

/** Layers ordered for stack display: Layer 5 (Capital) at top → Layer 1 (Community) at bottom. */
export const CULTURE_LAYERS_STACK_DISPLAY = [...CULTURE_LAYERS].sort((a, b) => b.number - a.number);

export function getCultureLayer(id: CultureLayerId): CultureLayer {
  const layer = CULTURE_LAYERS.find((l) => l.id === id);
  if (!layer) throw new Error(`Unknown culture layer: ${id}`);
  return layer;
}

export function isCultureLayerId(value: string): value is CultureLayerId {
  return CULTURE_LAYERS.some((l) => l.id === value);
}
