/** USD culture pack catalog — fiat checkout via Stripe. */

export type CampaignTag = "hq" | "triple_333";

export type PackDefinition = {
  slug: string;
  label: string;
  usd: number;
  usdCents: number;
  bonusBps: number;
  culturePoints: number;
  /** High tiers may grant supporter badge + optional mint credit later */
  grantsSupporterBadge?: boolean;
  grantsIdentityMintCredit?: boolean;
  /** Fundraise lane for progress aggregation */
  campaign?: CampaignTag;
  /** Short perk line on campaign landings */
  perkLine?: string;
};

function pointsForUsd(usd: number, bonusBps: number): number {
  const base = Math.round(usd * 100);
  return Math.round((base * (10_000 + bonusBps)) / 10_000);
}

const PACK_ROWS: Array<Omit<PackDefinition, "culturePoints" | "usdCents">> = [
  { slug: "pack_07", label: "Starter", usd: 0.7, bonusBps: 0 },
  { slug: "pack_7", label: "Culture", usd: 7, bonusBps: 1_400 },
  { slug: "pack_77", label: "Builder", usd: 77, bonusBps: 1_700 },
  { slug: "pack_777", label: "Patron", usd: 777, bonusBps: 2_200 },
  {
    slug: "pack_7777",
    label: "Founding",
    usd: 7_777,
    bonusBps: 2_800,
    grantsSupporterBadge: true,
  },
  {
    slug: "pack_77777",
    label: "Elder",
    usd: 77_777,
    bonusBps: 4_100,
    grantsSupporterBadge: true,
    grantsIdentityMintCredit: true,
    campaign: "hq",
    perkLine: "HQ Elder — naming rights + extended stay block",
  },
  {
    slug: "pack_7777777",
    label: "Whale",
    usd: 7_777_777,
    bonusBps: 5_400,
    grantsSupporterBadge: true,
    grantsIdentityMintCredit: true,
  },
  {
    slug: "pack_triple_333",
    label: "Triple 333 Ticket",
    usd: 3,
    bonusBps: 0,
    campaign: "triple_333",
    perkLine: "One entry · $999 round funds AI, winner, and marketing",
  },
  {
    slug: "hq_stay_77",
    label: "HQ Stay Backer",
    usd: 77.77,
    bonusBps: 500,
    campaign: "hq",
    perkLine: "2 nights at Culture HQ when open",
  },
  {
    slug: "hq_cowork_177",
    label: "HQ Cowork Week",
    usd: 177.77,
    bonusBps: 700,
    campaign: "hq",
    perkLine: "One cowork week + terrace access",
  },
  {
    slug: "hq_founding_777",
    label: "HQ Founding Key",
    usd: 777.77,
    bonusBps: 1_200,
    grantsSupporterBadge: true,
    campaign: "hq",
    perkLine: "Founding stay credits + profile badge",
  },
];

export const CULTURE_PACKS: PackDefinition[] = PACK_ROWS.map((row) => ({
  ...row,
  usdCents: Math.round(row.usd * 100),
  culturePoints: pointsForUsd(row.usd, row.bonusBps),
}));

export function getPackBySlug(slug: string): PackDefinition | undefined {
  return CULTURE_PACKS.find((p) => p.slug === slug);
}

export function getPacksByCampaign(tag: CampaignTag): PackDefinition[] {
  return CULTURE_PACKS.filter((p) => p.campaign === tag);
}

export const HQ_FUNDRAISE_GOAL_USD = 77_777;
export const TRIPLE_333_ROUND_USD = 999;
export const TRIPLE_333_TICKET_GOAL = 333;
export const TRIPLE_333_BUCKET_USD = 333;

export const HQ_PACK_SLUGS = [
  "hq_stay_77",
  "hq_cowork_177",
  "hq_founding_777",
  "pack_77777",
] as const;

export function packSlugsForCampaign(tag: CampaignTag): readonly string[] {
  switch (tag) {
    case "hq":
      return HQ_PACK_SLUGS;
    case "triple_333":
      return ["pack_triple_333"] as const;
    default: {
      const _exhaustive: never = tag;
      return _exhaustive;
    }
  }
}

export function formatPackUsd(usd: number): string {
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd >= 1_000_000) return `$${usd.toLocaleString("en-US")}`;
  return `$${usd.toLocaleString("en-US")}`;
}

export function formatCulturePoints(n: number): string {
  return n.toLocaleString("en-US");
}
