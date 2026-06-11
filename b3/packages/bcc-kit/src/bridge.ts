/**
 * BCC cross-chain bridge — LayerZero OFT 1:1 Base ↔ BSC.
 * Canonical BCC locks on Base; same amount mints on BSC (and vice versa).
 */
import { BCC_ADDRESS, BCC_CHAIN_ID } from "./index.js";
import { BSC_CHAIN_ID } from "./bnb.js";

/** LayerZero v2 endpoint IDs. */
export const LZ_EID_BASE = 30_184 as const;
export const LZ_EID_BSC = 30_102 as const;

export type BccBridgeDirection = "base-to-bsc" | "bsc-to-base";

export type BccBridgeConfig = {
  baseOftAdapter: `0x${string}` | "";
  bscOft: `0x${string}` | "";
  baseChainId: number;
  bscChainId: number;
  canonicalBcc: `0x${string}`;
};

export const DEFAULT_BCC_BRIDGE_CONFIG: BccBridgeConfig = {
  baseOftAdapter: "",
  bscOft: "",
  baseChainId: BCC_CHAIN_ID,
  bscChainId: BSC_CHAIN_ID,
  canonicalBcc: BCC_ADDRESS,
};

/** Minimal LayerZero OFT v2 send ABI (quoteSend + send). */
export const oftSendAbi = [
  {
    name: "quoteSend",
    type: "function",
    stateMutability: "view",
    inputs: [
      {
        name: "_sendParam",
        type: "tuple",
        components: [
          { name: "dstEid", type: "uint32" },
          { name: "to", type: "bytes32" },
          { name: "amountLD", type: "uint256" },
          { name: "minAmountLD", type: "uint256" },
          { name: "extraOptions", type: "bytes" },
          { name: "composeMsg", type: "bytes" },
          { name: "oftCmd", type: "bytes" },
        ],
      },
      { name: "_payInLzToken", type: "bool" },
    ],
    outputs: [
      {
        name: "fee",
        type: "tuple",
        components: [
          { name: "nativeFee", type: "uint256" },
          { name: "lzTokenFee", type: "uint256" },
        ],
      },
    ],
  },
  {
    name: "send",
    type: "function",
    stateMutability: "payable",
    inputs: [
      {
        name: "_sendParam",
        type: "tuple",
        components: [
          { name: "dstEid", type: "uint32" },
          { name: "to", type: "bytes32" },
          { name: "amountLD", type: "uint256" },
          { name: "minAmountLD", type: "uint256" },
          { name: "extraOptions", type: "bytes" },
          { name: "composeMsg", type: "bytes" },
          { name: "oftCmd", type: "bytes" },
        ],
      },
      {
        name: "_fee",
        type: "tuple",
        components: [
          { name: "nativeFee", type: "uint256" },
          { name: "lzTokenFee", type: "uint256" },
        ],
      },
      { name: "_refundAddress", type: "address" },
    ],
    outputs: [
      {
        name: "msgReceipt",
        type: "tuple",
        components: [
          { name: "guid", type: "bytes32" },
          { name: "nonce", type: "uint64" },
          { name: "fee", type: "tuple", components: [
            { name: "nativeFee", type: "uint256" },
            { name: "lzTokenFee", type: "uint256" },
          ]},
        ],
      },
      {
        name: "oftReceipt",
        type: "tuple",
        components: [
          { name: "amountSentLD", type: "uint256" },
          { name: "amountReceivedLD", type: "uint256" },
        ],
      },
    ],
  },
] as const;

/** Pack EVM address into bytes32 for LayerZero recipient. */
export function addressToBytes32(addr: `0x${string}`): `0x${string}` {
  return `0x${addr.slice(2).toLowerCase().padStart(64, "0")}` as `0x${string}`;
}

export function getBridgeSourceToken(
  direction: BccBridgeDirection,
  config: BccBridgeConfig,
): `0x${string}` | "" {
  if (direction === "base-to-bsc") return config.baseOftAdapter || "";
  return config.bscOft || "";
}

export function getBridgeDestEid(direction: BccBridgeDirection): number {
  return direction === "base-to-bsc" ? LZ_EID_BSC : LZ_EID_BASE;
}

export function isBridgeConfigured(config: BccBridgeConfig): boolean {
  return Boolean(config.baseOftAdapter && config.bscOft);
}

export function bridgeDirectionLabel(direction: BccBridgeDirection): string {
  return direction === "base-to-bsc" ? "Base → BNB Chain" : "BNB Chain → Base";
}
