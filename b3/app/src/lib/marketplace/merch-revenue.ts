import { TREASURY_SAFE_ADDRESS } from "@/lib/treasury-revenue-rules";

export const MERCH_PRODUCTION_BPS = 5500;
export const MERCH_PLATFORM_BPS = 2500;
export const MERCH_CREATOR_BPS = 2000;

export type MerchRevenueSplit = {
  productionBps: number;
  platformBps: number;
  creatorBps: number;
  productionUsd: number;
  platformUsd: number;
  creatorUsd: number;
  platformWallet: string;
  creatorWallet: string | null;
};

export function merchCreatorWallet(): string | undefined {
  const w = process.env.MERCH_CREATOR_WALLET?.trim();
  if (w && /^0x[a-fA-F0-9]{40}$/.test(w)) return w.toLowerCase();
  return undefined;
}

export function computeMerchRevenueSplit(priceUsd: number): MerchRevenueSplit {
  const price = Math.max(0, priceUsd);
  const productionUsd = Math.round(((price * MERCH_PRODUCTION_BPS) / 10_000) * 100) / 100;
  const platformUsd = Math.round(((price * MERCH_PLATFORM_BPS) / 10_000) * 100) / 100;
  const creatorUsd = Math.round((price - productionUsd - platformUsd) * 100) / 100;

  return {
    productionBps: MERCH_PRODUCTION_BPS,
    platformBps: MERCH_PLATFORM_BPS,
    creatorBps: MERCH_CREATOR_BPS,
    productionUsd,
    platformUsd,
    creatorUsd,
    platformWallet: TREASURY_SAFE_ADDRESS.toLowerCase(),
    creatorWallet: merchCreatorWallet() ?? null,
  };
}
