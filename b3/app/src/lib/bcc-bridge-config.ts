import {
  DEFAULT_BCC_BRIDGE_CONFIG,
  type BccBridgeConfig,
} from "@bc/bcc-kit";

function parseAddr(raw: string | undefined): `0x${string}` | "" {
  const v = raw?.trim() ?? "";
  if (v.length === 42 && v.startsWith("0x")) return v as `0x${string}`;
  return "";
}

export function getBccBridgeConfig(): BccBridgeConfig {
  return {
    ...DEFAULT_BCC_BRIDGE_CONFIG,
    baseOftAdapter: parseAddr(import.meta.env.VITE_BCC_OFT_ADAPTER_ADDRESS),
    bscOft: parseAddr(import.meta.env.VITE_BCC_BSC_OFT_ADDRESS),
  };
}
