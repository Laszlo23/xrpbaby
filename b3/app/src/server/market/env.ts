import {
  BASE_MAINNET_CHAIN_ID,
  resolveBcdTokenAddress,
  resolveMarketplaceContractAddress,
  resolvePitNftContractAddress,
} from "@bc/contracts-sdk";
import type { Address } from "viem";
import { base, baseSepolia } from "viem/chains";

export type MarketplaceNetworkId = "base" | "base-sepolia";

function env(): Record<string, string | undefined> {
  return process.env as Record<string, string | undefined>;
}

function parseAddr(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v as Address;
}

export function parseMarketplaceNetworkId(): MarketplaceNetworkId {
  const v = env().VITE_MARKETPLACE_NETWORK?.trim().toLowerCase();
  return v === "base-sepolia" ? "base-sepolia" : "base";
}

export function getMarketplaceChainId(): number {
  return parseMarketplaceNetworkId() === "base" ? base.id : baseSepolia.id;
}

export function getMarketplaceContractAddress(): Address | undefined {
  const e = env();
  return (
    resolveMarketplaceContractAddress(getMarketplaceChainId(), e) ??
    parseAddr(e.THIRDWEB_MARKETPLACE_CONTRACT_ADDRESS) ??
    parseAddr(e.MARKETPLACE_CONTRACT_ADDRESS)
  );
}

export function getPitNftContractAddress(): Address | undefined {
  return resolvePitNftContractAddress(BASE_MAINNET_CHAIN_ID, env());
}

export function getBccTokenAddress(): Address | undefined {
  return resolveBcdTokenAddress(BASE_MAINNET_CHAIN_ID, env());
}

export function getMarketplacePlatformFeeBps(): number | undefined {
  const raw = env().VITE_MARKETPLACE_PLATFORM_FEE_BPS?.trim();
  if (!raw) return undefined;
  const n = Number(raw);
  if (!Number.isFinite(n) || n < 0 || n > 10_000) return undefined;
  return Math.floor(n);
}

export function getMarketplaceFeeRecipient(): Address | undefined {
  const raw = env().VITE_MARKETPLACE_FEE_RECIPIENT?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) return undefined;
  return raw as Address;
}

export function getIdentityContractAddress(): Address | undefined {
  const raw = env().VITE_IDENTITY_CONTRACT_ADDRESS?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) return undefined;
  return raw as Address;
}

export function getIdentityV2ContractAddress(): Address | undefined {
  const raw = env().VITE_IDENTITY_V2_CONTRACT_ADDRESS?.trim();
  if (!raw || !/^0x[a-fA-F0-9]{40}$/i.test(raw)) return undefined;
  return raw as Address;
}
