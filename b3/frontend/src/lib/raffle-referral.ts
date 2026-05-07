const STORAGE_KEY = "buildchain_raffle_ref";

/** Persist `?ref=0x…` for raffle mint attribution (off-chain; see `postCreditRaffleReferralMint`). */
export function storeRaffleReferrerFromUrl(search: string): void {
  if (typeof window === "undefined") return;
  const q = search.startsWith("?") ? search.slice(1) : search;
  const params = new URLSearchParams(q);
  const ref = params.get("ref")?.trim();
  if (!ref || !/^0x[a-fA-F0-9]{40}$/i.test(ref)) return;
  try {
    sessionStorage.setItem(STORAGE_KEY, ref.toLowerCase());
  } catch {
    /* ignore */
  }
}

export function getStoredRaffleReferrer(): `0x${string}` | undefined {
  if (typeof window === "undefined") return undefined;
  try {
    const v = sessionStorage.getItem(STORAGE_KEY)?.trim();
    if (!v || !/^0x[a-fA-F0-9]{40}$/.test(v)) return undefined;
    return v as `0x${string}`;
  } catch {
    return undefined;
  }
}

export function buildDropShareUrl(slug: string, referrer: `0x${string}`): string {
  if (typeof window === "undefined") {
    return `/drops/${slug}?ref=${referrer}`;
  }
  const u = new URL(window.location.origin + `/drops/${slug}`);
  u.searchParams.set("ref", referrer);
  return u.toString();
}
