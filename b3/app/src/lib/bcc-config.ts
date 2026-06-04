import {
  BCC_ADDRESS,
  BCC_CHAIN_ID,
  BCC_DISCOUNT_BPS,
  BCC_DISCOUNT_LABEL,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
  bccDiscountedAmount,
  bccDiscountedUsd,
} from "@bc/bcc-kit";
import type { Address } from "viem";

export {
  BCC_ADDRESS,
  BCC_CHAIN_ID,
  BCC_DISCOUNT_BPS,
  BCC_DISCOUNT_LABEL,
  BCC_SYMBOL,
  BCC_UNISWAP_URL,
  bccDiscountedAmount,
  bccDiscountedUsd,
};

function parseAddr(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as Address;
  return undefined;
}

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : ({} as ImportMetaEnv);

export function getBccTokenAddress(): Address {
  return parseAddr(viteEnv.VITE_BCC_TOKEN_ADDRESS) ?? (BCC_ADDRESS as Address);
}

export function getBccUniswapUrl(): string {
  return viteEnv.VITE_BCC_UNISWAP_URL?.trim() || BCC_UNISWAP_URL;
}

export function getBccDiscountBps(): number {
  const raw = viteEnv.VITE_BCC_DISCOUNT_BPS;
  if (raw === undefined || raw === "") return BCC_DISCOUNT_BPS;
  const n = Number(raw);
  return Number.isFinite(n) ? n : BCC_DISCOUNT_BPS;
}

export function getBccOracleAddress(): Address | undefined {
  return parseAddr(viteEnv.VITE_BCC_ORACLE_ADDRESS);
}

export function getIdentityV2ContractAddress(): Address | undefined {
  return parseAddr(viteEnv.VITE_IDENTITY_V2_CONTRACT_ADDRESS);
}

export function getArtHubV2ContractAddress(): Address | undefined {
  return parseAddr(viteEnv.VITE_ART_HUB_V2_CONTRACT_ADDRESS);
}

export function getPlacesBccSaleAddress(): Address | undefined {
  return parseAddr(viteEnv.VITE_PLACES_BCC_SALE_ADDRESS);
}

export function isBccPayEnabled(): boolean {
  return Boolean(
    getIdentityV2ContractAddress() || getArtHubV2ContractAddress() || getPlacesBccSaleAddress(),
  );
}
