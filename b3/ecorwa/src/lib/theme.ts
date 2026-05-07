export type BcTheme = "land" | "city" | "water";

export const themeMeta: Record<BcTheme, { label: string; logoSuffix: string; documentTitle: string }> = {
  land: { label: "Land", logoSuffix: "LAND", documentTitle: "Building Culture — Land" },
  city: { label: "City", logoSuffix: "CITY", documentTitle: "Building Culture — City" },
  water: { label: "Water", logoSuffix: "WATER", documentTitle: "Building Culture — Water" },
};

export function isBcTheme(s: string): s is BcTheme {
  return s === "land" || s === "city" || s === "water";
}
