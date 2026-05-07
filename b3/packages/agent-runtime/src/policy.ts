import type { CommunityProfileRow } from "./strapi-profiles.js";

export type PolicyConfig = {
  /** Max successful mint+transfer per recipient per calendar month. */
  maxMintsPerRecipientPerMonth: number;
  /** Max recipients processed in one tick. */
  maxRecipientsPerTick: number;
  /** Optional: require ≥ this many check-in days in last 30d (0 = disabled). */
  minCheckInDaysLast30: number;
};

export const defaultPolicy: PolicyConfig = {
  maxMintsPerRecipientPerMonth: 1,
  maxRecipientsPerTick: 5,
  minCheckInDaysLast30: 0,
};

export type MonthlyMintCount = Map<string, number>;

/** Build map recipient(lower) -> count of successful `chain.ags_mint_transfer` this month. */
export function buildMonthlyMintCounts(
  ledgerRows: { action: string; params: unknown; createdAt: Date; status: string }[],
  now = new Date(),
): MonthlyMintCount {
  const y = now.getUTCFullYear();
  const m = now.getUTCMonth();
  const map = new Map<string, number>();
  for (const row of ledgerRows) {
    if (row.action !== "chain.ags_mint_transfer") continue;
    if (row.status !== "ok") continue;
    const d = row.createdAt;
    if (d.getUTCFullYear() !== y || d.getUTCMonth() !== m) continue;
    const p = row.params as { recipient?: string };
    const r = p?.recipient?.toLowerCase();
    if (!r) continue;
    map.set(r, (map.get(r) ?? 0) + 1);
  }
  return map;
}

export function filterEligibleRecipients(
  profiles: CommunityProfileRow[],
  monthlyCounts: MonthlyMintCount,
  checkInDaysByRecipient: Map<string, number> | undefined,
  policy: PolicyConfig = defaultPolicy,
): CommunityProfileRow[] {
  const minDays = policy.minCheckInDaysLast30;
  const eligible: CommunityProfileRow[] = [];
  for (const p of profiles) {
    const addr = p.ownerAddress.toLowerCase();
    const used = monthlyCounts.get(addr) ?? 0;
    if (used >= policy.maxMintsPerRecipientPerMonth) continue;
    if (minDays > 0 && checkInDaysByRecipient) {
      const days = checkInDaysByRecipient.get(addr) ?? 0;
      if (days < minDays) continue;
    }
    eligible.push(p);
    if (eligible.length >= policy.maxRecipientsPerTick) break;
  }
  return eligible;
}
