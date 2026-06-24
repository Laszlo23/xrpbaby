export const ACTIVE_WALLET_STORAGE_KEY = "culture_active_wallet";

export function readPersistedActiveWallet(): string | undefined {
  if (typeof sessionStorage === "undefined") return undefined;
  try {
    const raw = sessionStorage.getItem(ACTIVE_WALLET_STORAGE_KEY)?.trim();
    if (!raw || !/^0x[a-f0-9]{40}$/i.test(raw)) return undefined;
    return raw.toLowerCase();
  } catch {
    return undefined;
  }
}

export function writePersistedActiveWallet(address: string | undefined): void {
  if (typeof sessionStorage === "undefined") return;
  try {
    if (!address) {
      sessionStorage.removeItem(ACTIVE_WALLET_STORAGE_KEY);
      return;
    }
    sessionStorage.setItem(ACTIVE_WALLET_STORAGE_KEY, address.toLowerCase());
  } catch {
    // ignore quota / private mode
  }
}

export function clearPersistedActiveWallet(): void {
  writePersistedActiveWallet(undefined);
}
