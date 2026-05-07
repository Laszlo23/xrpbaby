/** Default BUILDCHAIN / 0x experience app origin. */
const DEFAULT_BUILDCHAIN_APP = "https://0x.buildingculture.capital";

/** Default X profile for Building Culture (matches main frontend fallback). */
const DEFAULT_COMMUNITY_X = "https://x.com/buildingcultu3";

export function buildchainAppUrl(): string {
  const v = import.meta.env.VITE_BUILDCHAIN_APP_URL as string | undefined;
  return v?.trim() || DEFAULT_BUILDCHAIN_APP;
}

/** Canonical public URL of this eco landing (when deployed); optional. */
export function ecoHubLandingUrl(): string | undefined {
  const v = import.meta.env.VITE_ECO_HUB_LANDING_URL as string | undefined;
  const t = v?.trim();
  return t || undefined;
}

export function communityXUrl(): string {
  const v = import.meta.env.VITE_COMMUNITY_X_URL as string | undefined;
  return v?.trim() || DEFAULT_COMMUNITY_X;
}

export function contactMailto(): string | undefined {
  const v = import.meta.env.VITE_CONTACT_EMAIL as string | undefined;
  const t = v?.trim();
  if (!t) return undefined;
  return `mailto:${t}`;
}
