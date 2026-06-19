/**
 * Space ID (.bnb) name resolution on BNB Smart Chain.
 * @see https://docs.space.id
 */

const SPACE_ID_API = "https://api.prd.space.id/v1";

export type SpaceIdResolveResult =
  | { ok: true; name: string; address: string; tld: "bnb" }
  | { ok: false; error: string; name?: string };

export type SpaceIdReverseResult =
  | { ok: true; name: string; address: string }
  | { ok: false; error: string; address?: string };

function parseBnbName(fullName: string): { label: string; tld: string } | null {
  const clean = fullName
    .toLowerCase()
    .trim()
    .replace(/\.bnb$/i, "");
  const parts = clean.split(".");
  if (parts.length === 1 && parts[0]) {
    return { label: parts[0].replace(/[^a-z0-9-]/g, ""), tld: "bnb" };
  }
  if (parts.length === 2 && parts[1] === "bnb" && parts[0]) {
    return { label: parts[0].replace(/[^a-z0-9-]/g, ""), tld: "bnb" };
  }
  return null;
}

/** Normalize to `handle.bnb` display form. */
export function formatBnbName(label: string): string {
  const clean = label.toLowerCase().replace(/[^a-z0-9-]/g, "");
  return clean ? `${clean}.bnb` : "";
}

/** Resolve `.bnb` name → wallet address via Space ID API. */
export async function resolveBnbName(name: string): Promise<SpaceIdResolveResult> {
  const parsed = parseBnbName(name);
  if (!parsed?.label) {
    return { ok: false, error: "invalid_name", name };
  }

  const fullName = `${parsed.label}.bnb`;
  try {
    const params = new URLSearchParams({ tld: parsed.tld, domain: parsed.label });
    const res = await fetch(`${SPACE_ID_API}/getAddress?${params.toString()}`, {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, error: "not_found", name: fullName };
    }
    const data = (await res.json()) as { address?: string; code?: number };
    const addr = data.address?.trim();
    if (!addr || !addr.startsWith("0x") || addr.length !== 42) {
      return { ok: false, error: "not_registered", name: fullName };
    }
    return { ok: true, name: fullName, address: addr, tld: "bnb" };
  } catch {
    return { ok: false, error: "api_unreachable", name: fullName };
  }
}

/** Reverse: wallet address → primary `.bnb` name (if any). */
export async function reverseBnbAddress(address: string): Promise<SpaceIdReverseResult> {
  const addr = address.trim().toLowerCase();
  if (!addr.startsWith("0x") || addr.length !== 42) {
    return { ok: false, error: "invalid_address" };
  }
  try {
    const params = new URLSearchParams({ address: addr });
    const res = await fetch(`${SPACE_ID_API}/getDomain?${params.toString()}`, {
      signal: AbortSignal.timeout(12_000),
      headers: { accept: "application/json" },
    });
    if (!res.ok) {
      return { ok: false, error: "no_name", address: addr };
    }
    const data = (await res.json()) as { domain?: string; tld?: string };
    const domain = data.domain?.trim();
    if (!domain) {
      return { ok: false, error: "no_name", address: addr };
    }
    const tld = (data.tld ?? "bnb").toLowerCase();
    return { ok: true, name: `${domain}.${tld}`, address: addr };
  } catch {
    return { ok: false, error: "api_unreachable", address: addr };
  }
}

/** Check if a `.bnb` label appears available (no reverse owner). */
export async function checkBnbNameAvailable(label: string): Promise<boolean> {
  const result = await resolveBnbName(label);
  return !result.ok && (result.error === "not_found" || result.error === "not_registered");
}
