/** USD culture pack catalog — fiat checkout via Stripe. */

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
  },
  {
    slug: "pack_7777777",
    label: "Whale",
    usd: 7_777_777,
    bonusBps: 5_400,
    grantsSupporterBadge: true,
    grantsIdentityMintCredit: true,
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

export function formatPackUsd(usd: number): string {
  if (usd < 1) return `$${usd.toFixed(2)}`;
  if (usd >= 1_000_000) return `$${usd.toLocaleString("en-US")}`;
  return `$${usd.toLocaleString("en-US")}`;
}

export function formatCulturePoints(n: number): string {
  return n.toLocaleString("en-US");
}
