/** Feature flags for absorbed satellite modules (set in .env). */
function flag(name: string, defaultOn = true): boolean {
  const v = import.meta.env[name];
  if (v === undefined || v === "") return defaultOn;
  return v === "1" || v === "true";
}

export const platformModules = {
  founding: flag("VITE_MODULE_FOUNDING", true),
  identity: flag("VITE_MODULE_IDENTITY", true),
  art: flag("VITE_MODULE_ART", true),
  places: flag("VITE_MODULE_PLACES", true),
  signal: flag("VITE_MODULE_SIGNAL", true),
  eco: flag("VITE_MODULE_ECO", true),
} as const;

export type PlatformModule = keyof typeof platformModules;
