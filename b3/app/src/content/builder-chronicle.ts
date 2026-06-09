import { farcasterFollowProfileUrl } from "@/lib/community-links";

export const BUILDER_WALLET = "0x502ce9FB1814cb03843967EC5E0D8F6AA3A3C2e1" as const;

export const BUILDER_PROFILE = {
  displayName: "Leonardo.based",
  legalName: "Laszlo Bihary",
  wallet: BUILDER_WALLET,
  paragraphUrl: "https://paragraph.com/0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1",
  paragraphPublicationsUrl:
    "https://paragraph.com/0x502ce9fb1814cb03843967ec5e0d8f6aa3a3c2e1/publications",
  farcasterUrl: farcasterFollowProfileUrl(),
  complianceRegistryNote:
    "The same wallet anchors ComplianceRegistry on Base — narrative and on-chain compliance share one identity.",
} as const;

export type ChronicleMilestone = {
  year: string;
  title: string;
  body: string;
};

export const CHRONICLE_MILESTONES: ChronicleMilestone[] = [
  {
    year: "1996",
    title: "IT from day one",
    body: "Started in information technology when the web was still wiring itself together — curiosity before crypto, craft before hype.",
  },
  {
    year: "2000s",
    title: "Web2 builder years",
    body: "Agencies, SEO, creative direction, decentralized experiments — learning how products feel when real people use them.",
  },
  {
    year: "2020s",
    title: "Onchain shift",
    body: "Wallet-native identity, fair drops, and proof-first culture — less pitch deck, more receipts.",
  },
  {
    year: "Today",
    title: "Building Culture",
    body: "A culture economy on Base: identity, places, art, BCC utility, and communities that fund themselves with transparency.",
  },
];

export type ParagraphEssay = {
  id: string;
  title: string;
  publishedAt: string;
  excerpt: string;
  theme: string;
  paragraphUrl: string;
  coverImageUrl?: string;
  /** Landing teaser — max 2 featured */
  featured?: boolean;
  /** Omit from landing hero / teaser */
  storyOnly?: boolean;
};

const IMG = (path: string) =>
  `https://img.paragraph.com/cdn-cgi/image/format=auto,width=1200,quality=85/https://storage.googleapis.com/papyrus_images/${path}`;

export const PARAGRAPH_ESSAYS: ParagraphEssay[] = [
  {
    id: "web2-to-building-culture",
    title: "From Web2 Builder to Building Culture",
    publishedAt: "2025-05-17",
    theme: "Origin",
    excerpt:
      "I started in IT in 1996. Building Culture is what happens when you stop optimizing for launches and start optimizing for places people actually live in — on-chain proof included.",
    paragraphUrl: "https://paragraph.com/@laszloleonardo",
    coverImageUrl: IMG("b7ca86a21fde9a401ce044e2d1355f3fefc48bd0b45c657d58e8dfee84948cd1.jpg"),
    featured: true,
  },
  {
    id: "natural-born-builder",
    title: "Natural Born builder",
    publishedAt: "2025-04-24",
    theme: "Identity",
    excerpt:
      "Some people negotiate with systems. Builders rewrite the parts that stop communities from participating. That instinct is what pulled me from Web2 clients to culture on Base.",
    paragraphUrl: "https://paragraph.com/@laszloleonardo",
    coverImageUrl: IMG("00d26c4db5c9bbca025c28e49dbb2f9190744cad63f350e589e9c2c9c9a07506.jpg"),
    featured: true,
  },
  {
    id: "building-fast-to-right",
    title: "From Building Fast to Building Right",
    publishedAt: "2025-03-19",
    theme: "Craft",
    excerpt:
      "Speed still matters — but only when it compounds trust. We ship in public, attestation over applause, and loops that reward people who show up week after week.",
    paragraphUrl: "https://paragraph.com/@laszloleonardo",
    coverImageUrl: IMG("8a1b687b25a408f54aa313b3dcff13055b7f100eaa5b9c5aed5b0a536e33308d.jpg"),
  },
  {
    id: "stablecoins-quiet-risk",
    title: "Stablecoins: The Quiet Risk No One in Crypto Wants to Talk About",
    publishedAt: "2025-03-31",
    theme: "Literacy",
    excerpt:
      "Stable does not mean invisible risk. I write about rails and reserves so our community learns the plumbing — not as a token pitch, but as adult literacy for onchain economies.",
    paragraphUrl: "https://paragraph.com/@laszloleonardo",
    coverImageUrl: IMG("3a19f6a98c2829dc31877e8c8c6f682145662586ae44835088614e0fee8f626b.jpg"),
  },
  {
    id: "fourth-time-played",
    title: "The 4th Time I Got Played — And Why This One Hit Different",
    publishedAt: "2025-02-17",
    theme: "Trust",
    excerpt:
      "Trust breaks in public long before contracts fail. That is why Building Culture defaults to verifiable drops, open ledgers, and saying no to vibes-only fundraising.",
    paragraphUrl: "https://paragraph.com/@laszloleonardo",
    coverImageUrl: IMG("e7f2aae7494834e0032f4856f234eeb27e8fd396e9e9918fb37b52dce548a08d.jpg"),
    storyOnly: true,
  },
];

export const BUILDER_PULL_QUOTES = [
  "I started in IT in 1996. Building Culture is the long game — places, proof, and people who stay.",
  "Change the system by shipping what communities can actually use.",
  "Build right, not just fast. The ledger remembers who showed up.",
] as const;

export function featuredEssays(): ParagraphEssay[] {
  return PARAGRAPH_ESSAYS.filter((e) => e.featured);
}

export function landingEssays(): ParagraphEssay[] {
  return PARAGRAPH_ESSAYS.filter((e) => !e.storyOnly || e.featured);
}

export function shortWallet(addr: string): string {
  if (addr.length < 12) return addr;
  return `${addr.slice(0, 6)}…${addr.slice(-4)}`;
}
