const STORAGE_PREFIX = "clid:identities:";

function storageKey(address: string): string {
  return `${STORAGE_PREFIX}${address.toLowerCase()}`;
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

export function saveIdentityForWallet(address: string, fullName: string): void {
  if (typeof window === "undefined") return;
  const normalized = fullName.toLowerCase();
  const existing = getStoredIdentities(address).filter((n) => n !== normalized);
  const next = [normalized, ...existing].slice(0, 20);
  localStorage.setItem(storageKey(address), JSON.stringify(next));
}
