/**
 * Deterministic demo stats for the "live funding meter" and property cards.
 * Not on-chain data — for hackathon / investor narrative only.
 */
function hashSeed(id: bigint): number {
  const s = id.toString();
  let h = 0;
  for (let i = 0; i < s.length; i++) {
    h = (h * 31 + s.charCodeAt(i)) >>> 0;
  }
  return h;
}

export type FundingStats = {
  /** Demo goal in USD */
  goalUsd: number;
  /** Demo funded amount in USD */
  fundedUsd: number;
  /** 0–1 */
  progress: number;
  investors: number;
  countries: number;
};

export function getFundingStats(propertyId: bigint, goalUsd: number): FundingStats {
  const h = hashSeed(propertyId);
  const ratio = 0.42 + ((h % 3800) / 10000) * 0.45; // 42%–87%
  const fundedUsd = Math.round(goalUsd * ratio);
  const investors = 120 + (h % 900);
  const countries = 8 + (h % 14);
  return {
    goalUsd,
    fundedUsd,
    progress: Math.min(1, fundedUsd / goalUsd),
    investors,
    countries,
  };
}

export function getGlobalFundingMeter(goalUsd = 10_000_000): FundingStats {
  const h = hashSeed(0x0badc0ffeen);
  const fundedUsd = 6_420_000 + (h % 120_000);
  const investors = 742 + (h % 80);
  const countries = 18 + (h % 5);
  return {
    goalUsd,
    fundedUsd,
    progress: Math.min(1, fundedUsd / goalUsd),
    investors,
    countries,
  };
}

export type GlobalPlatformStats = FundingStats & {
  /** Demo: properties with meaningful funding in the narrative */
  propertiesFunded: number;
  /** Demo: days left in community funding window */
  daysRemaining: number;
};

export function getGlobalPlatformStats(goalUsd = 10_000_000): GlobalPlatformStats {
  const base = getGlobalFundingMeter(goalUsd);
  const h = hashSeed(0x0cedbeefn);
  return {
    ...base,
    propertiesFunded: 4 + (h % 4),
    daysRemaining: 18 + (h % 14),
  };
}

const FOUNDING_TOTAL_SLOTS = 200;

/**
 * Deterministic “remaining founding investor slots” for UI — not enforced on-chain.
 */
export function getFoundingInvestorSlotsRemaining(): { remaining: number; total: number } {
  const h = hashSeed(0xf00dfacebeefn);
  const filled = 40 + (h % 120);
  return {
    remaining: Math.max(0, FOUNDING_TOTAL_SLOTS - filled),
    total: FOUNDING_TOTAL_SLOTS,
  };
}

const REGION_SLOTS = [
  { code: "AT", city: "Vienna" },
  { code: "DE", city: "Berlin" },
  { code: "US", city: "New York" },
  { code: "JP", city: "Tokyo" },
  { code: "SG", city: "Singapore" },
  { code: "GB", city: "London" },
  { code: "FR", city: "Paris" },
  { code: "CH", city: "Zurich" },
] as const;

function flagEmoji(alpha2: string): string {
  if (alpha2.length !== 2) return "🌍";
  const u = alpha2.toUpperCase();
  return Array.from(u)
    .map((c) => String.fromCodePoint(127397 + c.charCodeAt(0)))
    .join("");
}

export type DemoInvestorRegion = { flag: string; city: string; countryCode: string };

/** Illustrative participation regions — deterministic from property id; not geo analytics. */
export function getDemoInvestorRegions(propertyId: bigint): DemoInvestorRegion[] {
  const h = hashSeed(propertyId);
  const picks: DemoInvestorRegion[] = [];
  const used = new Set<number>();
  let i = 0;
  while (picks.length < 5 && i < 40) {
    const idx = (h + i * 17) % REGION_SLOTS.length;
    if (!used.has(idx)) {
      used.add(idx);
      const r = REGION_SLOTS[idx];
      picks.push({ flag: flagEmoji(r.code), city: r.city, countryCode: r.code });
    }
    i += 1;
  }
  return picks;
}
