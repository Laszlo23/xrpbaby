import { keccak256, toBytes, type Address, type Hex } from "viem";

function sortValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortValue);
  }
  if (value !== null && typeof value === "object") {
    const obj = value as Record<string, unknown>;
    const sorted: Record<string, unknown> = {};
    for (const key of Object.keys(obj).sort()) {
      sorted[key] = sortValue(obj[key]);
    }
    return sorted;
  }
  return value;
}

export function canonicalJsonString(value: unknown): string {
  return JSON.stringify(sortValue(value));
}

export function hashCanonicalJson(value: unknown): Hex {
  return keccak256(toBytes(canonicalJsonString(value)));
}

export function normalizeWallet(address: string): Address {
  return address.toLowerCase() as Address;
}

export function isWallet(address: string | undefined): address is Address {
  return Boolean(address && /^0x[a-fA-F0-9]{40}$/.test(address));
}
