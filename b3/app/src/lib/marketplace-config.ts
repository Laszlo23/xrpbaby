import type { Address } from "viem";
import { resolveMarketplaceContractAddress } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

export function getMarketplaceContractAddress(): Address | undefined {
  return resolveMarketplaceContractAddress(getDefaultChain().id, env());
}

/** Documented platform fee in basis points (1 bp = 0.01%). Shown to sellers when set. */
export function getMarketplacePlatformFeeBps(): number | undefined {
  const raw = env().VITE_MARKETPLACE_PLATFORM_FEE_BPS?.trim();
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 10_000) return undefined;
  return Math.floor(n);
}

/** Treasury / protocol recipient for the marketplace fee (display + reconciliation). */
export function getMarketplaceFeeRecipientAddress(): Address | undefined {
  const raw = env().VITE_MARKETPLACE_FEE_RECIPIENT?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) return undefined;
  return raw as Address;
}
