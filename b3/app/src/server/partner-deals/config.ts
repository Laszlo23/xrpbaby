import type { Address, Hex } from "viem";
import { base, baseSepolia } from "viem/chains";

export const SERVICE_DEAL_USDC_BASE: Address = "0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913";

export const serviceDealEscrowAbi = [
  {
    type: "function",
    name: "createDeal",
    inputs: [
      { name: "provider", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "metadataHash", type: "bytes32" },
      { name: "deliverBy", type: "uint256" },
      { name: "vetoWindowSeconds", type: "uint256" },
    ],
    outputs: [{ name: "dealId", type: "uint256" }],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "fund",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "submitEvidence",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "evidenceHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "proposeRuling",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "payoutBps", type: "uint16" },
      { name: "rulingHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "overrideRuling",
    inputs: [
      { name: "dealId", type: "uint256" },
      { name: "payoutBps", type: "uint16" },
      { name: "rulingHash", type: "bytes32" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "settle",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "deals",
    inputs: [{ name: "dealId", type: "uint256" }],
    outputs: [
      { name: "payer", type: "address" },
      { name: "provider", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "metadataHash", type: "bytes32" },
      { name: "deliverBy", type: "uint256" },
      { name: "vetoWindowSeconds", type: "uint256" },
      { name: "evidenceHash", type: "bytes32" },
      { name: "rulingHash", type: "bytes32" },
      { name: "payoutBps", type: "uint16" },
      { name: "ruledAt", type: "uint256" },
      { name: "state", type: "uint8" },
    ],
    stateMutability: "view",
  },
  {
    type: "function",
    name: "nextDealId",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
    stateMutability: "view",
  },
  {
    type: "event",
    name: "DealCreated",
    inputs: [
      { name: "dealId", type: "uint256", indexed: true },
      { name: "payer", type: "address", indexed: true },
      { name: "provider", type: "address", indexed: true },
      { name: "amount", type: "uint256", indexed: false },
      { name: "metadataHash", type: "bytes32", indexed: false },
      { name: "deliverBy", type: "uint256", indexed: false },
      { name: "vetoWindowSeconds", type: "uint256", indexed: false },
    ],
  },
] as const;

export enum OnChainDealState {
  Open = 0,
  Funded = 1,
  EvidenceSubmitted = 2,
  Ruled = 3,
  Overridden = 4,
  Settled = 5,
  Cancelled = 6,
}

export type ServiceDealConfig = {
  escrowAddress: Address;
  usdcAddress: Address;
  chainId: number;
  aiOracleConfigured: boolean;
  councilSafe?: Address;
  vetoWindowSeconds: number;
};

function parseAddress(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v.toLowerCase() as Address;
}

export function serviceDealConfig(): ServiceDealConfig | null {
  const escrowAddress = parseAddress(process.env.SERVICE_DEAL_ESCROW_ADDRESS);
  if (!escrowAddress) return null;

  const chainId = Number(
    process.env.SERVICE_DEAL_CHAIN_ID ?? process.env.VITE_EVM_CHAIN_ID ?? base.id,
  );
  const usdcAddress = parseAddress(process.env.SERVICE_DEAL_USDC_ADDRESS) ?? SERVICE_DEAL_USDC_BASE;
  const councilSafe = parseAddress(process.env.SERVICE_DEAL_COUNCIL_SAFE);
  const vetoWindowSeconds = Number(process.env.SERVICE_DEAL_VETO_WINDOW_SECONDS ?? 259_200);

  const aiKey = process.env.SERVICE_DEAL_AI_ORACLE_PRIVATE_KEY?.trim();
  const aiOracleConfigured = Boolean(aiKey && /^0x[a-fA-F0-9]{64}$/.test(aiKey));

  return {
    escrowAddress,
    usdcAddress,
    chainId,
    aiOracleConfigured,
    councilSafe,
    vetoWindowSeconds,
  };
}

export function councilWalletAllowlist(): Set<string> {
  const raw = process.env.SERVICE_DEAL_COUNCIL_WALLETS?.trim();
  if (!raw) {
    const safe = process.env.SERVICE_DEAL_COUNCIL_SAFE?.trim()?.toLowerCase();
    return safe ? new Set([safe]) : new Set();
  }
  return new Set(
    raw
      .split(",")
      .map((w) => w.trim().toLowerCase())
      .filter((w) => /^0x[a-fA-F0-9]{40}$/.test(w)),
  );
}

export function resolveServiceDealChain(chainId: number) {
  if (chainId === baseSepolia.id) return baseSepolia;
  return base;
}

export function dealStateLabel(state: number): string {
  switch (state) {
    case OnChainDealState.Open:
      return "open";
    case OnChainDealState.Funded:
      return "funded";
    case OnChainDealState.EvidenceSubmitted:
      return "evidence_submitted";
    case OnChainDealState.Ruled:
      return "ruled";
    case OnChainDealState.Overridden:
      return "overridden";
    case OnChainDealState.Settled:
      return "settled";
    case OnChainDealState.Cancelled:
      return "cancelled";
    default:
      return "unknown";
  }
}

export function metadataHashToHex(hash: string): Hex {
  const v = hash.startsWith("0x") ? hash : `0x${hash}`;
  return v as Hex;
}
