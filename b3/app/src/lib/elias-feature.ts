/** Feature flags for Elias unified shell */

export function eliasOrbEnabled(): boolean {
  const v = import.meta.env.VITE_ELIAS_ORB_ENABLED as string | undefined;
  if (v === "0" || v === "false") return false;
  if (v === "1" || v === "true") return true;
  // Default off in production until Supabase is configured; on in dev for local testing.
  return !import.meta.env.PROD;
}
