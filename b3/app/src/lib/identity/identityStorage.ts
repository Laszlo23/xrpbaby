const STORAGE_PREFIX = "clid:identities:";
const ACTIVE_PREFIX = "clid:active:";

function storageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
}

function activeKey(address: string): string {
  return `${ACTIVE_PREFIX}${address.toLowerCase()}`;
}

export function getStoredIdentities(address: string): string[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(storageKey(address));
    if (!raw) return [];
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((v): v is string => typeof v === "string" && v.includes("."));
  } catch {
    return [];
  }
}

export function getActiveIdentity(address: string): string | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(activeKey(address));
    if (!raw || !raw.includes(".")) return null;
    return raw.toLowerCase();
  } catch {
    return null;
  }
}

export function setActiveIdentity(address: string, fullName: string): void {
  if (typeof window === "undefined") return;
  const normalized = fullName.toLowerCase();
  localStorage.setItem(activeKey(address), normalized);
  saveIdentityForWallet(address, normalized);
}

export function mergeIdentityLists(...lists: string[][]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const list of lists) {
    for (const name of list) {
      const normalized = name.toLowerCase();
      if (!normalized.includes(".") || seen.has(normalized)) continue;
      seen.add(normalized);
      out.push(normalized);
    }
  }
  return out;
}

export function saveIdentityForWallet(address: string, fullName: string): void {
  if (typeof window === "undefined") return;
  const normalized = fullName.toLowerCase();
  const existing = getStoredIdentities(address).filter((n) => n !== normalized);
  const next = [normalized, ...existing].slice(0, 20);
  localStorage.setItem(storageKey(address), JSON.stringify(next));
}
