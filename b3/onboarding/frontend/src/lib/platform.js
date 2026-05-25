/** Unified platform origin (TanStack app). */
export const PLATFORM_ORIGIN =
  process.env.REACT_APP_PLATFORM_ORIGIN ||
  process.env.REACT_APP_PLATFORM_URL ||
  "https://app.buildingcultureid.space";

export const JOIN_URL = `${PLATFORM_ORIGIN.replace(/\/$/, "")}/join`;
export const FOREST_URL = `${PLATFORM_ORIGIN.replace(/\/$/, "")}/forest`;
export const PLATFORM_API = `${PLATFORM_ORIGIN.replace(/\/$/, "")}/api/platform`;
