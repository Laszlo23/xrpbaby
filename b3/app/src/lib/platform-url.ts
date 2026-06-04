function isLocalDevOrigin(origin: string): boolean {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(origin);
}

/** Canonical platform origin for onboarding CTAs and redirects. */
export function getPlatformOrigin(): string {
  if (typeof window !== "undefined") {
    const live = window.location.origin.replace(/\/$/, "");
    if (isLocalDevOrigin(live)) return live;
  }

  const fromEnv =
    import.meta.env.VITE_PLATFORM_ORIGIN ??
    import.meta.env.VITE_APP_ORIGIN ??
    import.meta.env.PUBLIC_APP_ORIGIN;
  if (fromEnv && typeof fromEnv === "string") {
    return fromEnv.replace(/\/$/, "");
  }
  if (typeof window !== "undefined") return window.location.origin.replace(/\/$/, "");
  return "https://app.buildingcultureid.space";
}

export function platformJoinUrl(): string {
  return `${getPlatformOrigin()}/join`;
}

export function platformForestUrl(): string {
  return `${getPlatformOrigin()}/forest`;
}
