/**
 * BNB Smart Chain → Base paths to acquire BCC (canonical token on Base).
 */
import { BCC_ADDRESS, BCC_UNISWAP_URL } from "./index.js";

/** BNB Smart Chain mainnet chain id. */
export const BSC_CHAIN_ID = 56 as const;

/** BNB native token symbol for LI.FI. */
export const BNB_NATIVE_SYMBOL = "BNB" as const;

/** USDT on BSC mainnet (BEP-20). */
export const BSC_USDT = "0x55d398326f99059fF775485246999027B3197955" as const;

/** USDC on BSC mainnet (BEP-20). */
export const BSC_USDC = "0x8AC76a51cc950d9822D68b83fE1Ad97B32Cd580d" as const;

export type BccBnbBuyStep = {
  step: number;
  title: string;
  description: string;
  href: string;
  provider: string;
};

export type BccBnbBuyRoute = {
  id: string;
  label: string;
  description: string;
  steps: BccBnbBuyStep[];
  /** One-shot cross-chain swap when supported. */
  primaryHref: string;
};

/** LI.FI Jumper — BNB/USDT on BSC → BCC on Base (best one-click UX). */
export function buildJumperBnbToBccUrl(fromToken: "BNB" | "USDT" | "USDC" = "BNB"): string {
  const params = new URLSearchParams({
    fromChain: String(BSC_CHAIN_ID),
    fromToken,
    toChain: "8453",
    toToken: BCC_ADDRESS,
  });
  return `https://jumper.exchange/?${params.toString()}`;
}

/** deBridge — bridge from BSC to Base with BCC as destination. */
export function buildDebridgeBnbToBaseBccUrl(): string {
  const params = new URLSearchParams({
    srcChainId: String(BSC_CHAIN_ID),
    dstChainId: "8453",
    dstChainTokenOut: BCC_ADDRESS,
  });
  return `https://app.debridge.finance/?${params.toString()}`;
}

/** Rango — cross-chain aggregator BNB → BCC. */
export function buildRangoBnbToBccUrl(): string {
  return "https://app.rango.exchange/swap/BNB.BSC/BCC.BASE";
}

/** PancakeSwap on BSC (for users who land with BNB on BSC before bridging). */
export function buildPancakeSwapBscUrl(): string {
  return "https://pancakeswap.finance/swap?chain=bsc";
}

/**
 * Curated routes for BNB Chain wallets to end up holding BCC on Base.
 * Same canonical BCC contract — no new token minted.
 */
export function buildBnbToBccRoutes(): BccBnbBuyRoute[] {
  const jumperBnb = buildJumperBnbToBccUrl("BNB");
  const jumperUsdt = buildJumperBnbToBccUrl("USDT");
  const debridge = buildDebridgeBnbToBaseBccUrl();
  const rango = buildRangoBnbToBccUrl();

  return [
    {
      id: "jumper-bnb",
      label: "Jumper (recommended)",
      description: "One flow: swap or bridge from BNB Chain to $BCC on Base.",
      primaryHref: jumperBnb,
      steps: [
        {
          step: 1,
          title: "Open Jumper",
          description: "Connect MetaMask or Trust Wallet. Source: BNB on BSC → $BCC on Base.",
          href: jumperBnb,
          provider: "LI.FI Jumper",
        },
        {
          step: 2,
          title: "Confirm on Base",
          description: "Add BCC to your Base wallet after the bridge completes.",
          href: BCC_UNISWAP_URL,
          provider: "Uniswap (verify balance)",
        },
      ],
    },
    {
      id: "jumper-usdt",
      label: "Jumper (USDT on BSC)",
      description: "If you already hold USDT on BNB Chain.",
      primaryHref: jumperUsdt,
      steps: [
        {
          step: 1,
          title: "USDT → BCC",
          description: "Bridge USDT from BSC and receive $BCC on Base.",
          href: jumperUsdt,
          provider: "LI.FI Jumper",
        },
      ],
    },
    {
      id: "debridge",
      label: "deBridge",
      description: "Bridge from BSC to Base with BCC as destination token when supported.",
      primaryHref: debridge,
      steps: [
        {
          step: 1,
          title: "Bridge with deBridge",
          description: "Connect BSC wallet; destination chain Base, token BCC.",
          href: debridge,
          provider: "deBridge",
        },
        {
          step: 2,
          title: "Fallback swap",
          description: "If you land with ETH/USDC on Base, buy $BCC on Uniswap.",
          href: BCC_UNISWAP_URL,
          provider: "Uniswap",
        },
      ],
    },
    {
      id: "rango",
      label: "Rango Exchange",
      description: "Cross-chain aggregator BNB → BCC.",
      primaryHref: rango,
      steps: [
        {
          step: 1,
          title: "Rango swap",
          description: "Select BNB (BSC) → BCC (Base) and connect both wallets if prompted.",
          href: rango,
          provider: "Rango",
        },
      ],
    },
  ];
}
