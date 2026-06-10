import type { Address } from "viem";
import { BCC_ADDRESS } from "@bc/bcc-kit";

export const ROOTS_POOLS = [
  {
    id: 0,
    slug: "seedling",
    name: "Seedling",
    lockDays: 30,
    weightBps: 10_000,
    weightLabel: "1.0×",
    description: "Open to anyone with BCC. Plant roots and share the treasury participation stream.",
    minPoints: 0,
    tiers: [] as string[],
  },
  {
    id: 1,
    slug: "builder-grove",
    name: "Builder Grove",
    lockDays: 90,
    weightBps: 13_000,
    weightLabel: "1.3×",
    description:
      "For active builders — Culture Points, genesis pass, or Builder Voice gold unlock this pool.",
    minPoints: 500,
    tiers: [] as string[],
  },
  {
    id: 2,
    slug: "elder-canopy",
    name: "Elder Canopy",
    lockDays: 180,
    weightBps: 15_000,
    weightLabel: "1.5×",
    description: "Founding and elder supporters — deepest lock, highest treasury weight.",
    minPoints: 0,
    tiers: ["founding", "elder"],
  },
] as const;

export type RootsPoolId = (typeof ROOTS_POOLS)[number]["id"];

/** Default unlock target — ~49 days from program start; override via env. */
const DEFAULT_UNLOCK_AT = "2026-07-29T00:00:00.000Z";

function parseAddr(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as Address;
  return undefined;
}

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : ({} as ImportMetaEnv);

export function isRootsStakingEnabled(): boolean {
  return viteEnv.VITE_BCC_ROOTS_ENABLED === "1" && Boolean(getRootsStakingAddress());
}

export function getRootsStakingAddress(): Address | undefined {
  return parseAddr(viteEnv.VITE_BCC_ROOTS_STAKING_ADDRESS);
}

export function getRootsUnlockAt(): Date {
  const raw = viteEnv.VITE_BCC_ROOTS_UNLOCK_AT?.trim() || DEFAULT_UNLOCK_AT;
  const d = new Date(raw);
  return Number.isNaN(d.getTime()) ? new Date(DEFAULT_UNLOCK_AT) : d;
}

export function getRootsCountdown(): {
  unlockAt: Date;
  daysRemaining: number;
  hoursRemaining: number;
  isPast: boolean;
  percentElapsed: number;
} {
  const unlockAt = getRootsUnlockAt();
  const now = Date.now();
  const end = unlockAt.getTime();
  const start = end - 49 * 24 * 60 * 60 * 1000;
  const total = end - start;
  const elapsed = Math.max(0, Math.min(total, now - start));
  const remaining = Math.max(0, end - now);
  return {
    unlockAt,
    daysRemaining: Math.ceil(remaining / (24 * 60 * 60 * 1000)),
    hoursRemaining: Math.ceil(remaining / (60 * 60 * 1000)),
    isPast: now >= end,
    percentElapsed: total > 0 ? Math.min(100, Math.round((elapsed / total) * 100)) : 100,
  };
}

export function getBccTokenForRoots(): Address {
  return parseAddr(viteEnv.VITE_BCC_TOKEN_ADDRESS) ?? (BCC_ADDRESS as Address);
}
