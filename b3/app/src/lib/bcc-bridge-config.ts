import {
  DEFAULT_BCC_BRIDGE_CONFIG,
  type BccBridgeConfig,
  type BccBridgeMode,
} from "@bc/bcc-kit";

function parseAddr(raw: string | undefined): `0x${string}` | "" {
  const v = raw?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

function parseMode(raw: string | undefined): BccBridgeMode {
  const v = raw?.trim().toLowerCase();
  if (v === "layerzero") return "layerzero";
  return "relayer";
}

export function getBccBridgeConfig(): BccBridgeConfig {
  return {
    ...DEFAULT_BCC_BRIDGE_CONFIG,
    mode: parseMode(import.meta.env.VITE_BRIDGE_MODE),
    baseBridgeVault: parseAddr(import.meta.env.VITE_BCC_BRIDGE_VAULT),
    wbccBsc: parseAddr(import.meta.env.VITE_WBCC_BSC_ADDRESS),
    baseOftAdapter: parseAddr(import.meta.env.VITE_BCC_OFT_ADAPTER_ADDRESS),
    bscOft: parseAddr(import.meta.env.VITE_BCC_BSC_OFT_ADDRESS),
  };
}

export function getBccBridgeConfigServer(): BccBridgeConfig {
  const env = typeof process !== "undefined" ? process.env : {};
  return {
    ...DEFAULT_BCC_BRIDGE_CONFIG,
    mode: parseMode(env.VITE_BRIDGE_MODE ?? env.BRIDGE_MODE),
    baseBridgeVault: parseAddr(env.VITE_BCC_BRIDGE_VAULT ?? env.BCC_BRIDGE_VAULT),
    wbccBsc: parseAddr(env.VITE_WBCC_BSC_ADDRESS ?? env.WBCC_ADDRESS),
    baseOftAdapter: parseAddr(env.VITE_BCC_OFT_ADAPTER_ADDRESS),
    bscOft: parseAddr(env.VITE_BCC_BSC_OFT_ADDRESS),
  };
}
