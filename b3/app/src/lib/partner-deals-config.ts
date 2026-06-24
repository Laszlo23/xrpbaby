import type { Address } from "viem";

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

const viteEnv =
  typeof import.meta !== "undefined" && import.meta.env ? import.meta.env : ({} as ImportMetaEnv);

function parseAddress(raw: string | undefined): Address | undefined {
  const v = raw?.trim() ?? "";
  if (!/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
  return v.toLowerCase() as Address;
}

export function getServiceDealEscrowAddress(): Address | undefined {
  return parseAddress(viteEnv.VITE_SERVICE_DEAL_ESCROW_ADDRESS as string | undefined);
}

export function getServiceDealUsdcAddress(): Address {
  return (
    parseAddress(viteEnv.VITE_SERVICE_DEAL_USDC_ADDRESS as string | undefined) ??
    SERVICE_DEAL_USDC_BASE
  );
}

export function serviceDealEscrowConfigured(): boolean {
  return Boolean(getServiceDealEscrowAddress());
}

export const erc20ApproveAbi = [
  {
    type: "function",
    name: "approve",
    inputs: [
      { name: "spender", type: "address" },
      { name: "amount", type: "uint256" },
    ],
    outputs: [{ name: "", type: "bool" }],
    stateMutability: "nonpayable",
  },
] as const;
