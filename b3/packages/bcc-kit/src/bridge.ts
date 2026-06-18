/**
 * BCC cross-chain bridge — Phase 1 custom relayer (lock/mint) or Phase 2 LayerZero OFT.
 * Canonical BCC locks on Base; same amount mints as wBCC on BSC (and vice versa).
 */
import { BCC_ADDRESS, BCC_CHAIN_ID } from "./constants.js";
import { BSC_CHAIN_ID } from "./bnb.js";

/** LayerZero v2 endpoint IDs. */
export const LZ_EID_BASE = 30_184 as const;
export const LZ_EID_BSC = 30_102 as const;

export type BccBridgeMode = "relayer" | "layerzero";

export type BccBridgeDirection = "base-to-bsc" | "bsc-to-base";

export type BccBridgeConfig = {
  mode: BccBridgeMode;
  /** Base vault locking canonical BCC (relayer mode). */
  baseBridgeVault: `0x${string}` | "";
  /** wBCC on BSC (relayer mode). */
  wbccBsc: `0x${string}` | "";
  /** Legacy LayerZero OFT adapter on Base. */
  baseOftAdapter: `0x${string}` | "";
  /** Legacy LayerZero OFT on BSC. */
  bscOft: `0x${string}` | "";
  baseChainId: number;
  bscChainId: number;
  canonicalBcc: `0x${string}`;
};

export const DEFAULT_BCC_BRIDGE_CONFIG: BccBridgeConfig = {
  mode: "relayer",
  baseBridgeVault: "",
  wbccBsc: "",
  baseOftAdapter: "",
  bscOft: "",
  baseChainId: BCC_CHAIN_ID,
  bscChainId: BSC_CHAIN_ID,
  canonicalBcc: BCC_ADDRESS,
};

/** BccBridgeVault.lock — Base → BSC */
export const bridgeVaultAbi = [
  {
    name: "lock",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "to", type: "address" },
      { name: "amount", type: "uint256" },
      { name: "dstChainId", type: "uint256" },
    ],
    outputs: [],
  },
  {
    name: "lockedBalance",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalLocked",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalUnlocked",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "lockNonce",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
] as const;

/** WrappedBCC on BSC — mint/burn via relayer */
export const wbccAbi = [
  {
    name: "bridgeBurn",
    type: "function",
    stateMutability: "nonpayable",
    inputs: [
      { name: "amount", type: "uint256" },
      { name: "dstChainId", type: "uint256" },
    ],
    outputs: [{ name: "nonce", type: "uint256" }],
  },
  {
    name: "totalMinted",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "totalBurned",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "uint256" }],
  },
  {
    name: "canonicalBcc",
    type: "function",
    stateMutability: "view",
    inputs: [],
    outputs: [{ name: "", type: "address" }],
  },
] as const;

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

/** Public burn sink for BCC supply tracking. */
export const BCC_BURN_ADDRESS = "0x000000000000000000000000000000000000dEaD" as const;

/** Pack EVM address into bytes32 for LayerZero recipient. */
export function addressToBytes32(addr: `0x${string}`): `0x${string}` {
  return `0x${addr.slice(2).toLowerCase().padStart(64, "0")}` as `0x${string}`;
}

export function getBridgeSourceToken(
  direction: BccBridgeDirection,
  config: BccBridgeConfig,
): `0x${string}` | "" {
  if (config.mode === "relayer") {
    return direction === "base-to-bsc" ? config.canonicalBcc : config.wbccBsc;
  }
  return direction === "base-to-bsc" ? config.baseOftAdapter || "" : config.bscOft || "";
}

export function getBridgeDestEid(direction: BccBridgeDirection): number {
  return direction === "base-to-bsc" ? LZ_EID_BSC : LZ_EID_BASE;
}

export function isRelayerBridgeConfigured(config: BccBridgeConfig): boolean {
  return Boolean(config.baseBridgeVault && config.wbccBsc);
}

export function isLayerZeroBridgeConfigured(config: BccBridgeConfig): boolean {
  return Boolean(config.baseOftAdapter && config.bscOft);
}

export function isBridgeConfigured(config: BccBridgeConfig): boolean {
  return config.mode === "layerzero"
    ? isLayerZeroBridgeConfigured(config)
    : isRelayerBridgeConfigured(config);
}

export function bridgeDirectionLabel(direction: BccBridgeDirection): string {
  return direction === "base-to-bsc" ? "Base → BNB Chain" : "BNB Chain → Base";
}

export function bridgeTokenSymbol(
  direction: BccBridgeDirection,
  config: BccBridgeConfig,
): string {
  if (config.mode === "relayer") {
    return direction === "base-to-bsc" ? "BCC" : "wBCC";
  }
  return "BCC";
}
