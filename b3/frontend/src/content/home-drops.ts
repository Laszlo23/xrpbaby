import type { Address } from "viem";
import { getCampaignAddress } from "@/lib/campaign";
import { ticketNftVideo } from "@/content/ticket-nft-media";

export type WinnerMode = "one" | "limited";

export type DropStoryPage = {
  /** Short line under hero media */
  pieceTagline?: string;
  /** Emotional paragraphs */
  theStory: string[];
  theValue: {
    origin: string;
    artist: string;
    rarity: string;
    cultural: string;
  };
  theAccess: string;
  onChainNote?: string;
};

/** RWA lane for hero tiles + static card covers when video is suppressed */
export type ExperienceCategory = "stay" | "art" | "venue";

export type HomeDrop = {
  slug: string;
  title: string;
  artist: string;
  assetValueLabel: string;
  /** Large overlay on card image, e.g. "WORTH €10K+" */
  worthLabel: string;
  winnerMode: WinnerMode;
  /** e.g. "1 winner only" */
  winnerCopy: string;
  image: string;
  story?: string;
  ticketsSold: number;
  totalTickets: number;
  endsAt: Date;
  rarity: "common" | "rare" | "legendary";
  campaignAddress?: Address;
  ticketPriceLabel?: string;
  storyPage?: DropStoryPage;
  /** Optional still for DropCard when hero video is suppressed (featured strip owns the loop). */
  posterImage?: string;
  /** Stay / art / venue — used for featured filmstrip chips and static covers */
  experienceCategory?: ExperienceCategory;
  /** Home “Real assets” filmstrip only; ticket cards use `image`. */
  filmstripVideo?: string;
};

const campaignAddress = getCampaignAddress();

/** Featured filmstrip uses the first N pools (same order as `homeDrops`). */
export const HOME_FEATURED_DROP_COUNT = 3;

export const homeDrops: HomeDrop[] = [
  {
    slug: "berggasse-vienna-penthouse",
    title: "Berggasse Penthouse — Vienna Stay",
    artist: "Build Culture Residences",
    assetValueLabel: "Up to 10 nights · penthouse",
    worthLabel: "WORTH €10K+",
    winnerMode: "one",
    winnerCopy: "1 winner only",
    image: ticketNftVideo("vacationpenthous.mp4"),
    story:
      "Win seven to ten nights in the Berggasse penthouse—full residence access with Vienna at your doorstep. Each ticket enters a fair draw; one holder receives coordinated fulfillment after selection. Transparent odds on-chain; the stay is IRL.",
    ticketsSold: 842,
    totalTickets: 1000,
    endsAt: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000),
    rarity: "legendary",
    campaignAddress,
    experienceCategory: "stay",
    filmstripVideo: ticketNftVideo("vacationpenthous.mp4"),
  },
  {
    slug: "erotic-night-vienna",
    title: "Erotic Night — Vienna",
    artist: "Night Edition",
    assetValueLabel: "VIP evening · adults-only",
    worthLabel: "WORTH €3K+",
    winnerMode: "limited",
    winnerCopy: "Limited winners",
    image: "/nfts/experienceEventVienna.mp4",
    story:
      "A curated adults-only evening in Vienna built around atmosphere, discretion, and detail. Mint for the draw; winners unlock the full experience. Selection is verifiable on-chain; the night stays private where it belongs.",
    ticketsSold: 456,
    totalTickets: 750,
    endsAt: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000),
    rarity: "rare",
    /** Same on-chain pool as other cards until per-drop contracts ship (v2). */
    campaignAddress,
    experienceCategory: "venue",
    filmstripVideo: "/nfts/erotic-experience.mp4",
  },
  {
    slug: "art-vienna-convention",
    title: "ART Vienna — Convention + Painting",
    artist: "Convention Floor",
    assetValueLabel: "Entry + original work",
    worthLabel: "WORTH €8K+",
    winnerMode: "one",
    winnerCopy: "1 winner only",
    image: ticketNftVideo("artinvienna.mp4"),
    story:
      "Convention access for ART in Vienna—win and leave with an original painting from the featured wall. Ticketing lives on-chain; the artwork ships after the draw.",
    ticketsSold: 123,
    totalTickets: 500,
    endsAt: new Date(Date.now() + 12 * 24 * 60 * 60 * 1000),
    rarity: "common",
    campaignAddress,
    storyPage: {
      pieceTagline: "Not just a piece — a moment preserved. Now unlocked — onchain.",
      theStory: [
        "This piece was never meant to be traded in public feeds. It lived in private collections, moved through hands that understood its weight.",
        "One piece. One winner. Everything else is watching.",
        "Carried through collections — anchored in culture — now traceable, ownable, alive.",
      ],
      theValue: {
        origin: "Featured wall · ART Vienna convention circuit",
        artist: "Convention Floor selection — original work, exhibition-grade framing",
        rarity: "Single original — not a print run",
        cultural:
          "Tied to a living European art weekend — the kind of room where taste is argued for, not advertised.",
      },
      theAccess:
        "Each ticket is an entry into a provably fair draw. One holder receives convention access plus custody path for the painting — fulfillment coordinated after on-chain winner selection.",
      onChainNote:
        "Ticket balances and draw phases are enforced by the campaign contract — mint, phase progression, and payout rules are all inspectable on-chain.",
    },
    experienceCategory: "art",
    filmstripVideo: ticketNftVideo("artinvienna.mp4"),
  },
  {
    slug: "hilton-vienna-week",
    title: "Hilton Vienna — Week + Dining + Culture",
    artist: "Build Culture Stays",
    assetValueLabel: "7 nights · 3 dinners · 3 art afternoons",
    worthLabel: "WORTH €12K+",
    winnerMode: "one",
    winnerCopy: "1 winner only",
    image: ticketNftVideo("viennastay.mp4"),
    story:
      "One week at the Hilton in Vienna—room as your base—with dinner on three evenings and art-and-culture afternoons on three days across the city.",
    ticketsSold: 318,
    totalTickets: 600,
    endsAt: new Date(Date.now() + 8 * 24 * 60 * 60 * 1000),
    rarity: "rare",
    campaignAddress,
    experienceCategory: "stay",
  },
];

export function featuredHomeDrops(): HomeDrop[] {
  return homeDrops.slice(0, HOME_FEATURED_DROP_COUNT);
}

export function getDropBySlug(slug: string): HomeDrop | undefined {
  return homeDrops.find((d) => d.slug === slug);
}

/** Sum of minted tickets across homepage pools — marketing “entries in play”. */
export function totalTicketEntries(): number {
  return homeDrops.reduce((acc, d) => acc + Math.min(d.ticketsSold, d.totalTickets), 0);
}
