/** localStorage key — first visit shows immersive intro before full homepage. Bump when intro content changes materially. */
export const FIRST_VISIT_INTRO_STORAGE_KEY = "building-culture-intro-v2";

export function markIntroSeen(): void {
  try {
    if (typeof window === "undefined") return;
    window.localStorage.setItem(FIRST_VISIT_INTRO_STORAGE_KEY, "1");
  } catch {
    /* private mode / quota */
  }
}

export function hasSeenIntro(): boolean {
  try {
    if (typeof window === "undefined") return true;
    return window.localStorage.getItem(FIRST_VISIT_INTRO_STORAGE_KEY) === "1";
  } catch {
    return true;
  }
}
