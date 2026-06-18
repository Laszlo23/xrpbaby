/**
 * Known-contract registry for the human-friendly explorer.
 *
 * Maps addresses to human labels so the interpreter can say
 * "the official BCC token" instead of `0xb890…ab07`. Base-focused for now,
 * but keyed by chain id so other chains can be added later.
 */
import {
  BASE_USDC,
  BASE_WETH,
  BCC_ADDRESS,
  BCC_CHAIN_ID,
  UNISWAP_QUOTER_V2,
  UNISWAP_SWAP_ROUTER,
} from "@bc/bcc-kit";

export type KnownContractCategory =
  | "token"
  | "dex"
  | "identity"
  | "marketplace"
  | "treasury"
  | "burn"
  | "infra";

export type KnownContract = {
  address: string;
  label: string;
  category: KnownContractCategory;
  /** True for Building Culture ecosystem contracts (gets an ecosystem badge). */
  ecosystem: boolean;
  description?: string;
};

const TREASURY_SAFE = "0xce03f6e734cc48393ce41b257e998c68b521eb5c";
const ZERO_ADDRESS = "0x0000000000000000000000000000000000000000";
const DEAD_ADDRESS = "0x000000000000000000000000000000000000dead";

/** Uniswap Universal Router (Base mainnet). */
const UNISWAP_UNIVERSAL_ROUTER = "0x3fc91a3afd70395cd496c647d5a6cc9d4b2b7fad";
/** Aerodrome v2 router (Base mainnet). */
const AERODROME_ROUTER = "0xcf77a3ba9a5ca399b7c97c74d54e5b1beb874e43";

function env(key: string): string | undefined {
  const v = process.env[key]?.trim();
  return v || undefined;
}

function buildBaseRegistry(): Map<string, KnownContract> {
  const entries: KnownContract[] = [
    {
      address: BCC_ADDRESS,
      label: "BCC — Building Culture Coin",
      category: "token",
      ecosystem: true,
      description: "The official Building Culture Coin ERC-20 token on Base.",
    },
    {
      address: TREASURY_SAFE,
      label: "Building Culture Treasury",
      category: "treasury",
      ecosystem: true,
      description: "Building Culture treasury safe.",
    },
    {
      address: BASE_USDC,
      label: "USDC (digital dollars)",
      category: "token",
      ecosystem: false,
      description: "Circle's USD-backed stablecoin — 1 USDC is designed to equal 1 US dollar.",
    },
    {
      address: BASE_WETH,
      label: "Wrapped ETH (WETH)",
      category: "token",
      ecosystem: false,
      description: "Ether wrapped as an ERC-20 token so it can be traded like other tokens.",
    },
    {
      address: UNISWAP_SWAP_ROUTER,
      label: "Uniswap swap router",
      category: "dex",
      ecosystem: false,
      description: "Uniswap's contract that executes token swaps.",
    },
    {
      address: UNISWAP_UNIVERSAL_ROUTER,
      label: "Uniswap Universal Router",
      category: "dex",
      ecosystem: false,
      description: "Uniswap's router used by the Uniswap app for swaps.",
    },
    {
      address: UNISWAP_QUOTER_V2,
      label: "Uniswap quoter",
      category: "dex",
      ecosystem: false,
    },
    {
      address: AERODROME_ROUTER,
      label: "Aerodrome router",
      category: "dex",
      ecosystem: false,
      description: "Aerodrome is the main decentralized exchange on Base.",
    },
    {
      address: ZERO_ADDRESS,
      label: "Zero address (mint/burn)",
      category: "burn",
      ecosystem: false,
      description: "Tokens coming from here are newly created; tokens sent here are destroyed.",
    },
    {
      address: DEAD_ADDRESS,
      label: "Burn address",
      category: "burn",
      ecosystem: false,
      description: "Tokens sent here are permanently destroyed.",
    },
  ];

  const identity = env("VITE_IDENTITY_CONTRACT_ADDRESS");
  if (identity) {
    entries.push({
      address: identity,
      label: "Culture Layer Identity (.culture names)",
      category: "identity",
      ecosystem: true,
      description: "Registers human-readable .culture names for wallets.",
    });
  }
  const hub = env("VITE_HUB_ADDRESS");
  if (hub) {
    entries.push({
      address: hub,
      label: "Building Culture Hub",
      category: "infra",
      ecosystem: true,
      description: "Building Culture's on-chain hub contract.",
    });
  }
  const marketplace = env("VITE_MARKETPLACE_CONTRACT_ADDRESS");
  if (marketplace) {
    entries.push({
      address: marketplace,
      label: "Building Culture Marketplace",
      category: "marketplace",
      ecosystem: true,
      description: "The Building Culture NFT marketplace contract.",
    });
  }

  const map = new Map<string, KnownContract>();
  for (const e of entries) {
    map.set(e.address.toLowerCase(), { ...e, address: e.address.toLowerCase() });
  }
  return map;
}

let baseRegistry: Map<string, KnownContract> | null = null;

/** Look up a known contract by address (Base only for now). */
export function lookupKnownContract(chainId: number, address: string): KnownContract | null {
  if (chainId !== BCC_CHAIN_ID) return null;
  if (!baseRegistry) baseRegistry = buildBaseRegistry();
  return baseRegistry.get(address.toLowerCase()) ?? null;
}

export function isBurnAddress(address: string): boolean {
  const a = address.toLowerCase();
  return a === ZERO_ADDRESS || a === DEAD_ADDRESS;
}

export function isZeroAddress(address: string): boolean {
  return address.toLowerCase() === ZERO_ADDRESS;
}
