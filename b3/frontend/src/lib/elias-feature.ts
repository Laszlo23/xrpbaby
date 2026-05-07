/** Feature flags for Elias unified shell */

export function eliasOrbEnabled(): boolean {
  const v = import.meta.env.VITE_ELIAS_ORB_ENABLED as string | undefined;
  return v === "1" || v === "true";
}
