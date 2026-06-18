/** Culture Atlas satellite — deployed at buildingcultureid.space/demo/atlas */
export const CULTURE_ATLAS_ORIGIN = "https://buildingcultureid.space";
export const CULTURE_ATLAS_BASE = `${CULTURE_ATLAS_ORIGIN}/demo/atlas`;

export type AtlasCreatorDiscipline = "visual-art" | "music" | "voice" | "storytelling" | "curation";

export function cultureAtlasUrl(path = ""): string {
  const base = CULTURE_ATLAS_BASE.replace(/\/$/, "");
  const suffix = path.startsWith("/") ? path : path ? `/${path}` : "";
  return `${base}${suffix}`;
}

export function cultureAtlasCreatorsUrl(params?: {
  discipline?: AtlasCreatorDiscipline;
  ref?: string;
}): string {
  const url = new URL(cultureAtlasUrl("/creators"));
  if (params?.discipline) url.searchParams.set("discipline", params.discipline);
  if (params?.ref) url.searchParams.set("ref", params.ref);
  return url.toString();
}
