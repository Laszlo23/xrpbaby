/** Culture Chronicles: Meme Edition — 11-chapter story NFT collection. */

import type { CoachMood, CulturePillar } from "@/lib/character/culture-coach";

export type ChronicleTier = "common" | "uncommon" | "rare" | "legendary";

const BUCKET = "https://0xlaszlo.4everbucket.com/buildingculture";
const HERO = (slug: string) => `/chronicles/${slug}.webp`;
const THUMB = (slug: string) => `/chronicles/thumbs/${slug}.webp`;
const BUCKET_PNG = (file: string) => `${BUCKET}/${file}.png`;

export type CultureChronicle = {
  /** Route id e.g. ch-01 */
  id: string;
  editionId: number;
  slug: string;
  title: string;
  quote: string;
  quoteWin?: string;
  narration: string[];
  tier: ChronicleTier;
  /** Regular mint price in wei (matches contract). */
  priceWei: bigint;
  /** Launch window price for editions 1–3. */
  launchPriceWei?: bigint;
  maxSupply: number;
  mood: CoachMood;
  pillars?: CulturePillar[];
  easterEgg?: string;
  heroSrc: string;
  thumbSrc: string;
  bucketFallback: string;
  coachSceneId: string;
};

export const CHRONICLE_EDITION_COUNT = 11;

export const CHRONICLES: CultureChronicle[] = [
  {
    id: "ch-01",
    editionId: 1,
    slug: "pop-culture",
    title: "The Feed Explained",
    quote: "Pop culture isn't random — it's engineered attention.",
    quoteWin: "You see the game. Now you play yours.",
    narration: [
      "Every scroll is a vote. The feed learned what keeps you watching.",
      "Building Culture starts when you stop renting your attention to the algorithm.",
      "Mint this chapter — proof you chose story over noise.",
    ],
    tier: "common",
    priceWei: 280_000_000_000_000n,
    launchPriceWei: 190_000_000_000_000n,
    maxSupply: 777,
    mood: "focus",
    pillars: ["impact"],
    heroSrc: HERO("pop-culture"),
    thumbSrc: THUMB("pop-culture"),
    bucketFallback: BUCKET_PNG("popcultureexplain"),
    coachSceneId: "pop-culture",
  },
  {
    id: "ch-02",
    editionId: 2,
    slug: "the-standard",
    title: "The Standard",
    quote: "Likes are the old scoreboard. Credentials are the new one.",
    quoteWin: "You set the bar — not the timeline.",
    narration: [
      "The old standard: go viral or vanish.",
      "The new standard: prove work, stack reputation, own your lane.",
      "This scene is your receipt that you get it.",
    ],
    tier: "common",
    priceWei: 280_000_000_000_000n,
    launchPriceWei: 190_000_000_000_000n,
    maxSupply: 777,
    mood: "focus",
    pillars: ["credentials", "reputation"],
    heroSrc: HERO("the-standard"),
    thumbSrc: THUMB("the-standard"),
    bucketFallback: BUCKET_PNG("standartexplain"),
    coachSceneId: "the-standard",
  },
  {
    id: "ch-03",
    editionId: 3,
    slug: "story-begins",
    title: "Once Upon a Scroll",
    quote: "You're not background NPC energy. You're the main character.",
    quoteWin: "Chapter 3 unlocked. Plot twist: you build.",
    narration: [
      "Every builder has an origin story — usually buried under notifications.",
      "This is yours: you showed up, wallet ready, culture curious.",
      "Mint the opening chapter. The rest of the chronicle hits different when you own it.",
    ],
    tier: "common",
    priceWei: 280_000_000_000_000n,
    launchPriceWei: 190_000_000_000_000n,
    maxSupply: 777,
    mood: "idle",
    pillars: ["identity"],
    heroSrc: HERO("story-begins"),
    thumbSrc: THUMB("story-begins"),
    bucketFallback: BUCKET_PNG("story"),
    coachSceneId: "story-begins",
  },
  {
    id: "ch-04",
    editionId: 4,
    slug: "father-figure",
    title: "Father of the Culture",
    quote: "Legacy isn't inherited. It's compiled commit by commit.",
    quoteWin: "Mentor mode: activated.",
    narration: [
      "Someone had to say: stop chasing clout, start building infrastructure.",
      "Father of the Culture isn't a person — it's the voice that tells you to ship.",
      "Rare supply. Serious builders only.",
    ],
    tier: "uncommon",
    priceWei: 410_000_000_000_000n,
    maxSupply: 333,
    mood: "focus",
    pillars: ["identity", "impact"],
    heroSrc: HERO("father-figure"),
    thumbSrc: THUMB("father-figure"),
    bucketFallback: BUCKET_PNG("father"),
    coachSceneId: "father-figure",
  },
  {
    id: "ch-05",
    editionId: 5,
    slug: "the-gang",
    title: "The Gang Assembles",
    quote: "Crew > clout. Always.",
    quoteWin: "Your squad just leveled up.",
    narration: [
      "Solo grind is heroic. Gang grind is civilization.",
      "Share this chapter when your people pull up — referrals stack Culture Points.",
      "Mint proof you roll with builders, not spectators.",
    ],
    tier: "uncommon",
    priceWei: 410_000_000_000_000n,
    maxSupply: 333,
    mood: "win",
    pillars: ["access", "impact"],
    heroSrc: HERO("the-gang"),
    thumbSrc: THUMB("the-gang"),
    bucketFallback: BUCKET_PNG("gang"),
    coachSceneId: "the-gang",
  },
  {
    id: "ch-06",
    editionId: 6,
    slug: "friends-not-frienmds",
    title: "Friends (Not Frienmds)",
    quote: "Real friends roast your typos and still mint with you.",
    quoteWin: "Frienmds forever — on-chain.",
    narration: [
      "The typo is intentional. The loyalty isn't.",
      "Culture is inside jokes that become protocols.",
      "Collect the meme. Gift it to your day-ones.",
    ],
    tier: "common",
    priceWei: 280_000_000_000_000n,
    maxSupply: 777,
    mood: "win",
    pillars: ["impact"],
    easterEgg: "frienmds",
    heroSrc: HERO("friends-not-frienmds"),
    thumbSrc: THUMB("friends-not-frienmds"),
    bucketFallback: BUCKET_PNG("frienmds"),
    coachSceneId: "friends-not-frienmds",
  },
  {
    id: "ch-07",
    editionId: 7,
    slug: "relate-daily",
    title: "Relate Daily",
    quote: "Small steps today. Big legacy tomorrow.",
    quoteWin: "1% better. Compounded.",
    narration: [
      "You don't need a perfect day. You need a better choice than yesterday.",
      "Daily check-ins, daily builds, daily proof you're still here.",
      "This chapter pairs with Forest daily quests — mint it, then claim.",
    ],
    tier: "common",
    priceWei: 280_000_000_000_000n,
    maxSupply: 777,
    mood: "guilt",
    pillars: ["impact"],
    heroSrc: HERO("relate-daily"),
    thumbSrc: THUMB("relate-daily"),
    bucketFallback: BUCKET_PNG("relate"),
    coachSceneId: "relate-daily",
  },
  {
    id: "ch-08",
    editionId: 8,
    slug: "reputation-upgrade",
    title: "Reputation Upgrade",
    quote: "Because likes don't pay rent.",
    quoteWin: "Culture Rep maxed. Vibes: epic.",
    narration: [
      "Attention fades. Reputation compounds.",
      "Credentials, quests, on-chain receipts — that's the new flex.",
      "Only 111 mints. Status bar at 100%.",
    ],
    tier: "rare",
    priceWei: 810_000_000_000_000n,
    maxSupply: 111,
    mood: "win",
    pillars: ["reputation", "credentials"],
    heroSrc: HERO("reputation-upgrade"),
    thumbSrc: THUMB("reputation-upgrade"),
    bucketFallback: BUCKET_PNG("reputation"),
    coachSceneId: "reputation-upgrade",
  },
  {
    id: "ch-09",
    editionId: 9,
    slug: "evolution",
    title: "Evolution",
    quote: "Same human needs. Upgraded infrastructure.",
    quoteWin: "Culture civilization — we build legacy.",
    narration: [
      "Web1: read. Web2: post. Web3: own. Building Culture: prove and automate.",
      "You're early to the stack that outlasts the cycle.",
      "Rare chapter. Evolution isn't cheap — but it's affordable.",
    ],
    tier: "rare",
    priceWei: 810_000_000_000_000n,
    maxSupply: 111,
    mood: "idle",
    pillars: ["identity", "credentials", "reputation", "access", "impact"],
    heroSrc: HERO("evolution"),
    thumbSrc: THUMB("evolution"),
    bucketFallback: BUCKET_PNG("evolution"),
    coachSceneId: "evolution",
  },
  {
    id: "ch-10",
    editionId: 10,
    slug: "park-token",
    title: "Park Token",
    quote: "We own it. We build it. We earn together.",
    quoteWin: "From renting attention to owning culture.",
    narration: [
      "The park used to be rented. Now the community holds the keys.",
      "Tokenized culture isn't speculation — it's coordination with receipts.",
      "Mint before the gates close — 333 max.",
    ],
    tier: "uncommon",
    priceWei: 410_000_000_000_000n,
    maxSupply: 333,
    mood: "focus",
    pillars: ["identity", "impact"],
    heroSrc: HERO("park-token"),
    thumbSrc: THUMB("park-token"),
    bucketFallback: BUCKET_PNG("parktoken"),
    coachSceneId: "park-token",
  },
  {
    id: "ch-11",
    editionId: 11,
    slug: "vibe-friends",
    title: "Vibe Friends",
    quote: "Cartoon capital is cute. Culture capital is forever.",
    quoteWin: "Finale minted. Chronicle Founder loading…",
    narration: [
      "Homage to the grail-era collectibles — rebuilt for builders who ship.",
      "77 legendary mints. The set isn't complete without this frame.",
      "Own the finale. Become a Chronicle Founder.",
    ],
    tier: "legendary",
    priceWei: 2_830_000_000_000_000n,
    maxSupply: 77,
    mood: "win",
    pillars: ["reputation", "access", "impact"],
    heroSrc: HERO("vibe-friends"),
    thumbSrc: THUMB("vibe-friends"),
    bucketFallback: BUCKET_PNG("veefriends"),
    coachSceneId: "vibe-friends",
  },
];

const byId = new Map(CHRONICLES.map((c) => [c.id, c]));
const byEdition = new Map(CHRONICLES.map((c) => [c.editionId, c]));

export function getChronicle(id: string): CultureChronicle | undefined {
  return byId.get(id);
}

export function getChronicleByEdition(editionId: number): CultureChronicle | undefined {
  return byEdition.get(editionId);
}

export function chronicleSharePath(id: string): string {
  return `/chronicles/${id}`;
}
