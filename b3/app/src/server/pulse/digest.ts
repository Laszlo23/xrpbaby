import { createHash } from "node:crypto";

/** Stable JSON stringify for attestation digests. */
export function canonicalJson(value: unknown): string {
  return JSON.stringify(value, (_k, v) => {
    if (v && typeof v === "object" && !Array.isArray(v)) {
      return Object.keys(v as Record<string, unknown>)
        .sort()
        .reduce<Record<string, unknown>>((acc, key) => {
          acc[key] = (v as Record<string, unknown>)[key];
          return acc;
        }, {});
    }
    return v;
  });
}

export function digestHex(payload: unknown): string {
  return createHash("sha256").update(canonicalJson(payload)).digest("hex");
}

export function dayIdUtc(d = new Date()): string {
  return d.toISOString().slice(0, 10);
}

/** uint256 day id: YYYYMMDD as integer for on-chain attestDay. */
export function dayIdToUint(dayId: string): bigint {
  return BigInt(dayId.replace(/-/g, ""));
}
