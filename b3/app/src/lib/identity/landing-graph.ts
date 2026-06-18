/** Shared landing identity graph demo config (client + server). */
export const DEFAULT_LANDING_GRAPH_IDENTITY = "laszloleonardo.eth";

export function resolveLandingGraphIdentity(
  envValue: string | undefined,
  queryValue?: string | null,
): string {
  const fromQuery = queryValue?.trim();
  if (fromQuery) return fromQuery;
  const fromEnv = envValue?.trim();
  if (fromEnv) return fromEnv;
  return DEFAULT_LANDING_GRAPH_IDENTITY;
}
