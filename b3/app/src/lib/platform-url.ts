/** Canonical platform origin for onboarding CTAs and redirects. */
export function getPlatformOrigin(): string {
  const fromEnv =
    import.meta.env.VITE_PLATFORM_ORIGIN ??
    import.meta.env.VITE_APP_ORIGIN ??
    import.meta.env.PUBLIC_APP_ORIGIN;
  if (fromEnv && typeof fromEnv === "string") {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin;
  return "https://app.buildingcultureid.space";
}

export function platformJoinUrl(): string {
  return `${getPlatformOrigin()}/join`;
}

export function platformForestUrl(): string {
  return `${getPlatformOrigin()}/forest`;
}
