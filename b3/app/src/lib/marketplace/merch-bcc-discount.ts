import { createPublicClient, erc20Abi, formatUnits, http, type Address } from "viem";
import { base } from "viem/chains";

import { BCC_ADDRESS } from "@bc/bcc-kit";

const MIN_BCC_UNITS = 1_000n * 10n ** 18n;

function baseRpc(): string {
  return (
    process.env.BASE_RPC_URL?.trim() ||
    process.env.VITE_BASE_RPC_URL?.trim() ||
    "https://mainnet.base.org"
  );
}

export function merchBccHolderDiscountBps(): number {
  const raw = process.env.MERCH_BCC_HOLDER_DISCOUNT_BPS?.trim();
  const n = raw ? Number(raw) : 0;
  if (!Number.isFinite(n) || n <= 0) return 0;
  return Math.min(5000, Math.floor(n));
}

export async function walletQualifiesForMerchBccDiscount(wallet: string): Promise<boolean> {
  if (merchBccHolderDiscountBps() <= 0) return false;
  try {
    const client = createPublicClient({ chain: base, transport: http(baseRpc()) });
    const balance = await client.readContract({
      address: BCC_ADDRESS as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [wallet as Address],
    });
    return balance >= MIN_BCC_UNITS;
  } catch {
    return false;
  }
}

export function applyMerchBccDiscount(priceUsd: number, discountBps: number): number {
  if (discountBps <= 0) return priceUsd;
  const discounted = priceUsd * (1 - discountBps / 10_000);
  return Math.round(discounted * 100) / 100;
}

export function merchBccDiscountLabel(bps: number): string {
  return `${(bps / 100).toFixed(2)}% BCC holder discount`;
}

export async function resolveMerchCheckoutPrice(wallet: string, basePriceUsd: number) {
  const bps = merchBccHolderDiscountBps();
  const qualifies = bps > 0 ? await walletQualifiesForMerchBccDiscount(wallet) : false;
  if (!qualifies) {
    return { priceUsd: basePriceUsd, discountBps: 0, qualifies: false };
  }
  return {
    priceUsd: applyMerchBccDiscount(basePriceUsd, bps),
    discountBps: bps,
    qualifies: true,
    label: merchBccDiscountLabel(bps),
  };
}

export async function readWalletBccBalanceFormatted(wallet: string): Promise<string | null> {
  try {
    const client = createPublicClient({ chain: base, transport: http(baseRpc()) });
    const balance = await client.readContract({
      address: BCC_ADDRESS as Address,
      abi: erc20Abi,
      functionName: "balanceOf",
      args: [wallet as Address],
    });
    return formatUnits(balance, 18);
  } catch {
    return null;
  }
}
