import { BCC_ADDRESS, BCC_DISCOUNT_LABEL, BCC_SYMBOL } from "@bc/bcc-kit";
import hubAbiJson from "@/modules/art/lib/abis/buildingCultureHub.json";
import type { Abi } from "viem";

export { BCC_ADDRESS, BCC_DISCOUNT_LABEL, BCC_SYMBOL };

export const hubAbi = hubAbiJson as Abi;

export const hubAddress = (import.meta.env.VITE_HUB_ADDRESS ?? "") as `0x${string}`;

export const hubV2Address = (import.meta.env.VITE_HUB_V2_ADDRESS ?? "") as `0x${string}`;

export const isHubConfigured = hubAddress.length === 42 && hubAddress.startsWith("0x");

export const isHubV2Configured = hubV2Address.length === 42 && hubV2Address.startsWith("0x");

export const hubV2Abi = [
  {
    type: "function",
    name: "mintTicketsWithBcc",
    inputs: [
      { name: "editionId", type: "uint256" },
      { name: "quantity", type: "uint256" },
    ],
    outputs: [],
    stateMutability: "nonpayable",
  },
  {
    type: "function",
    name: "quoteTicketsWithBcc",
    inputs: [
      { name: "editionId", type: "uint256" },
      { name: "quantity", type: "uint256" },
    ],
    outputs: [{ name: "bccCost", type: "uint256" }],
    stateMutability: "view",
  },
  ...hubAbi,
] as Abi;

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

/** Maps UI artwork slugs to on-chain edition IDs (set at deploy time). */
export const editionIds = {
  horizon: 0n,
  storm: 1n,
} as const;

export type ArtworkSlug = keyof typeof editionIds;
