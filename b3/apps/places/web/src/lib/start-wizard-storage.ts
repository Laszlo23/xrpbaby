/** Persisted step index for `/start` wizard (0–4). Client-only. */
export const START_WIZARD_STORAGE_KEY = "building-culture-start-wizard-v1";

const MAX_STEP = 4;

export function readStartWizardStep(): number | null {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(START_WIZARD_STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { step?: unknown };
    const step = parsed.step;
    if (typeof step === "number" && Number.isFinite(step) && step >= 0 && step <= MAX_STEP) {
      return Math.floor(step);
    }
    return null;
  } catch {
    return null;
  }
}

export function writeStartWizardStep(step: number): void {
  if (typeof window === "undefined") return;
  try {
    const clamped = Math.min(MAX_STEP, Math.max(0, Math.floor(step)));
    localStorage.setItem(START_WIZARD_STORAGE_KEY, JSON.stringify({ step: clamped }));
  } catch {
    /* quota / private mode */
  }
}
