/** Feature flags for Elias unified shell */

export function eliasOrbEnabled(): boolean {
  const v = import.meta.env.VITE_ELIAS_ORB_ENABLED as string | undefined;
  // Default-on so Elias is present across the app in local/dev builds.
  // You can explicitly disable with VITE_ELIAS_ORB_ENABLED=0/false.
  if (!v) return true;
  return v === "1" || v === "true";
}
