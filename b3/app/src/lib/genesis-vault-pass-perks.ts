import type { GenesisVaultTier } from "@/lib/genesis-district-config";

/** Concrete on-product perks per tier — counsel should review before public commitments. */
export const GENESIS_VAULT_PASS_TIER_PERKS: Record<GenesisVaultTier, readonly string[]> = {
  phase0: [
    "Earliest vault positioning for new RWA pools",
    "Profile XP bonus while the Phase 0 program is live",
    "Access to the Genesis District mint surface and holder quests",
  ],
  phase1: [
    "Early-builder queue before public vault windows",
    "Eligible for marketplace / listing promos when fee discounts are published",
    "Weighted community quests vs. non-holders (transparent in profile)",
  ],
  phase2: [
    "Public vault access while supply lasts",
    "Hub perks as listed on the roadmap (no guaranteed allocation)",
    "Stacks with raffle entries — separate receipts, separate rules",
  ],
};
