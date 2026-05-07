import type { Address } from "viem";
import {
  resolveDistinctLegacyGenesisDistrictAddress,
  resolveGenesisVaultPassPhase0Address,
  resolveGenesisVaultPassPhase1Address,
  resolveGenesisVaultPassPhase2Address,
} from "@bc/contracts-sdk";
import { parseBcdChainId } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

const chain = () => parseBcdChainId();

/**
 * Phase 0 vault pass (ERC-721). Uses `VITE_GENESIS_VAULT_PASS_PHASE0`, or falls back to legacy
 * `VITE_GENESIS_DISTRICT_CONTRACT` so existing deployments keep working.
 */
export function getGenesisVaultPassPhase0Address(): Address | undefined {
  return resolveGenesisVaultPassPhase0Address(chain(), env());
}

export function getGenesisVaultPassPhase1Address(): Address | undefined {
  return resolveGenesisVaultPassPhase1Address(chain(), env());
}

export function getGenesisVaultPassPhase2Address(): Address | undefined {
  return resolveGenesisVaultPassPhase2Address(chain(), env());
}

/**
 * When both `VITE_GENESIS_VAULT_PASS_PHASE0` and `VITE_GENESIS_DISTRICT_CONTRACT` are set to
 * different addresses, balances on both count toward Phase 0 eligibility.
 */
export function getDistinctLegacyGenesisDistrictAddress(): Address | undefined {
  return resolveDistinctLegacyGenesisDistrictAddress(chain(), env());
}

/** @deprecated Use `getGenesisVaultPassPhase0Address` — same Phase 0 resolution. */
export function getGenesisDistrictContract(): Address | undefined {
  return getGenesisVaultPassPhase0Address();
}

export type GenesisVaultTier = "phase0" | "phase1" | "phase2";

/** Badge + daily XP: Phase 0 beats Phase 1 beats Phase 2. */
export function resolveHighestGenesisVaultTier(opts: {
  balancePhase0: bigint;
  balancePhase1: bigint;
  balancePhase2: bigint;
  /** Extra Phase 0 balance from legacy contract when distinct from Phase 0 address */
  balanceLegacyPhase0?: bigint;
}): GenesisVaultTier | null {
  const b0 = opts.balancePhase0 + (opts.balanceLegacyPhase0 ?? 0n);
  if (b0 > 0n) return "phase0";
  if (opts.balancePhase1 > 0n) return "phase1";
  if (opts.balancePhase2 > 0n) return "phase2";
  return null;
}

/** Daily claim XP bonus by highest tier held (+20 / +12 / +6). */
export function dailyXpBonusForGenesisVaultTier(tier: GenesisVaultTier | null): number {
  if (tier === "phase0") return 20;
  if (tier === "phase1") return 12;
  if (tier === "phase2") return 6;
  return 0;
}

/** One-time holder quest XP per tier. */
export function genesisVaultHolderQuestXp(tier: GenesisVaultTier): number {
  switch (tier) {
    case "phase0":
      return 45;
    case "phase1":
      return 35;
    case "phase2":
      return 25;
  }
}

/** Hero / genesis-district visual — defaults to bundled PNG if unset. */
export function getGenesisDistrictHeroImageUrl(): string {
  const v = import.meta.env.VITE_GENESIS_DISTRICT_IMAGE_URL as string | undefined;
  if (v?.trim()) return v.trim();
  return "/genesis-district-phase0.png";
}

/** Tier images for card UI (optional per-phase artwork). */
export function getGenesisVaultPassTierImageUrl(tier: GenesisVaultTier): string {
  const key =
    tier === "phase0"
      ? "VITE_GENESIS_VAULT_PASS_IMAGE_PHASE0"
      : tier === "phase1"
        ? "VITE_GENESIS_VAULT_PASS_IMAGE_PHASE1"
        : "VITE_GENESIS_VAULT_PASS_IMAGE_PHASE2";
  const v = import.meta.env[key] as string | undefined;
  if (v?.trim()) return v.trim();
  return getGenesisDistrictHeroImageUrl();
}
