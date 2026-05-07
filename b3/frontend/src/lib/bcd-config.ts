import type { Address } from "viem";
import {
  resolveBcdGenesisClaimAddress,
  resolveBcdSaleAddress,
  resolveBcdTokenAddress,
} from "@bc/contracts-sdk";
import { parseBcdChainId } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

function envAddr(key: string): Address | undefined {
  const v = import.meta.env[key] as string | undefined;
  if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

function envBool(key: string, defaultTrue: boolean): boolean {
  const v = import.meta.env[key] as string | undefined;
  if (v === undefined || v === "") return defaultTrue;
  return v === "1" || v === "true";
}

function envBigInt(key: string, fallback: bigint): bigint {
  const v = import.meta.env[key] as string | undefined;
  if (!v || !/^\d+$/.test(v)) return fallback;
  try {
    return BigInt(v);
  } catch {
    return fallback;
  }
}

/** BCD minted per 1 whole ETH (display conversion for ticket pricing). Default 1000. */
export function getBcdPerWholeEth(): bigint {
  return envBigInt("VITE_BCD_PER_ETH", 1000n);
}

export function getBcdTokenAddress(): Address | undefined {
  return resolveBcdTokenAddress(parseBcdChainId(), env());
}

export function getBcdSaleAddress(): Address | undefined {
  return resolveBcdSaleAddress(parseBcdChainId(), env());
}

/** Merkle genesis claim contract (BCDGenesisClaim). */
export function getBcdGenesisClaimAddress(): Address | undefined {
  return resolveBcdGenesisClaimAddress(parseBcdChainId(), env());
}

/** Optional HTTPS base (no trailing slash). Eligibility files at `${base}/${address}.json`. */
export function getBcdGenesisEligibilityBase(): string | undefined {
  const v = import.meta.env.VITE_BCD_GENESIS_ELIGIBILITY_BASE as string | undefined;
  if (!v?.trim()) return undefined;
  return v.replace(/\/$/, "").trim();
}

/** Active sale round id from env (default 1). Must match `configureRound` on BCDFixedPriceSale. */
export function getBcdSaleRoundId(): bigint {
  const v = import.meta.env.VITE_BCD_SALE_ROUND_ID as string | undefined;
  if (!v?.trim() || !/^\d+$/.test(v.trim())) return 1n;
  try {
    return BigInt(v.trim());
  } catch {
    return 1n;
  }
}

/** Optional HTTPS base for private-round JSON: `${base}/${address}-${roundId}.json`. */
export function getBcdSaleEligibilityBase(): string | undefined {
  const v = import.meta.env.VITE_BCD_SALE_ELIGIBILITY_BASE as string | undefined;
  if (!v?.trim()) return undefined;
  return v.replace(/\/$/, "").trim();
}

/** Optional `0x` + 64 hex for transparency (must match on-chain root when published). */
export function getBcdGenesisMerkleDisplay(): string | undefined {
  const v = import.meta.env.VITE_BCD_GENESIS_MERKLE_ROOT_HEX as string | undefined;
  if (!v?.trim() || !/^0x[a-fA-F0-9]{64}$/.test(v.trim())) return undefined;
  return v.trim();
}

/** When true, show small print that raffle still settles in native gas token until upgraded. */
export function showLegacyEthSettlement(): boolean {
  return envBool("VITE_SHOW_LEGACY_ETH_SETTLEMENT", true);
}

export const BCD_SYMBOL = (import.meta.env.VITE_BCD_SYMBOL as string | undefined) || "BCD";

export function getDemoBcdBalanceDisplay(): string {
  const raw = import.meta.env.VITE_BCD_DEMO_BALANCE as string | undefined;
  if (raw && raw.trim()) return raw.trim();
  return "1,000";
}

/** @internal — used by marketplace / legacy modules that still read raw env keys */
export { envAddr };
