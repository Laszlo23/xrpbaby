/**
 * Solana → Base paths to acquire BCC (token is Base-only).
 */
import { BCC_ADDRESS, BCC_UNISWAP_URL } from "./index.js";

/** Wrapped SOL mint (native). */
export const SOLANA_NATIVE_MINT = "So11111111111111111111111111111111111111112" as const;

/** USDC on Solana mainnet. */
export const SOLANA_USDC_MINT = "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v" as const;

export type BccSolanaBuyStep = {
  step: number;
  title: string;
  description: string;
  href: string;
  provider: string;
};

export type BccSolanaBuyRoute = {
  id: string;
  label: string;
  description: string;
  steps: BccSolanaBuyStep[];
  /** One-shot cross-chain swap when supported. */
  primaryHref: string;
};

/** LI.FI Jumper — SOL/USDC on Solana → BCC on Base (best one-click UX). */
export function buildJumperSolToBccUrl(fromToken: "SOL" | "USDC" = "SOL"): string {
  const from =
    fromToken === "USDC"
      ? `SOLANA.${SOLANA_USDC_MINT}`
      : "SOL.SOL";
  const params = new URLSearchParams({
    fromChain: "SOL",
    fromToken,
    toChain: "8453",
    toToken: BCC_ADDRESS,
  });
  return `https://jumper.exchange/?${params.toString()}`;
}

/** deBridge — bridge to Base then swap to BCC on Uniswap if needed. */
export function buildDebridgeToBaseBccUrl(): string {
  const params = new URLSearchParams({
    dstChainId: "8453",
    dstChainTokenOut: BCC_ADDRESS,
  });
  return `https://app.debridge.finance/?${params.toString()}`;
}

/** Rango — cross-chain aggregator (manual pair confirmation in UI). */
export function buildRangoSolToBccUrl(): string {
  return "https://app.rango.exchange/swap/SOL.SOLANA/BCC.BASE";
}

/** Jupiter bridge tab (Solana-native UX, route to EVM). */
export function buildJupiterBridgeUrl(): string {
  return "https://jup.ag/?tab=bridge";
}

/**
 * Curated routes for Solana wallets to end up holding BCC on Base.
 * Users still receive BCC on Base (same contract); discounts apply when paying from Base.
 */
export function buildSolanaToBccRoutes(): BccSolanaBuyRoute[] {
  const jumperSol = buildJumperSolToBccUrl("SOL");
  const jumperUsdc = buildJumperSolToBccUrl("USDC");
  const debridge = buildDebridgeToBaseBccUrl();
  const rango = buildRangoSolToBccUrl();
  const jupiter = buildJupiterBridgeUrl();

  return [
    {
      id: "jumper-sol",
      label: "Jumper (recommended)",
      description: "One flow: swap or bridge from Solana to $BCC on Base.",
      primaryHref: jumperSol,
      steps: [
        {
          step: 1,
          title: "Open Jumper",
          description: "Connect Phantom (or Solana wallet). Source: SOL on Solana → $BCC on Base.",
          href: jumperSol,
          provider: "LI.FI Jumper",
        },
        {
          step: 2,
          title: "Confirm on Base",
          description: "Add BCC to your Base wallet in the app after the bridge completes.",
          href: BCC_UNISWAP_URL,
          provider: "Uniswap (verify balance)",
        },
      ],
    },
    {
      id: "jumper-usdc",
      label: "Jumper (USDC on Solana)",
      description: "If you already hold USDC on Solana.",
      primaryHref: jumperUsdc,
      steps: [
        {
          step: 1,
          title: "USDC → BCC",
          description: "Bridge USDC from Solana and receive $BCC on Base.",
          href: jumperUsdc,
          provider: "LI.FI Jumper",
        },
      ],
    },
    {
      id: "debridge",
      label: "deBridge",
      description: "Bridge to Base with BCC as destination token when supported.",
      primaryHref: debridge,
      steps: [
        {
          step: 1,
          title: "Bridge with deBridge",
          description: "Connect Solana wallet; destination chain Base, token BCC.",
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
      description: "Cross-chain aggregator SOL → BCC.",
      primaryHref: rango,
      steps: [
        {
          step: 1,
          title: "Rango swap",
          description: "Select SOL (Solana) → BCC (Base) and connect both wallets if prompted.",
          href: rango,
          provider: "Rango",
        },
      ],
    },
    {
      id: "jupiter-bridge",
      label: "Jupiter Bridge",
      description: "Bridge from Jupiter, then acquire BCC on Base.",
      primaryHref: jupiter,
      steps: [
        {
          step: 1,
          title: "Bridge on Jupiter",
          description: "Move assets toward Base / EVM.",
          href: jupiter,
          provider: "Jupiter",
        },
        {
          step: 2,
          title: "Buy BCC on Base",
          description: "Complete purchase on Uniswap on Base.",
          href: BCC_UNISWAP_URL,
          provider: "Uniswap",
        },
      ],
    },
  ];
}
