import { z } from "zod";

/** Documented prefs envelope persisted in `elias_preference_profiles.prefs` (partial OK). */
export const eliasPrefsEnvelopeSchema = z.object({
  intentTier: z.string().max(64).optional(),
  favoredProperties: z.array(z.string().max(128)).max(80).optional(),
  riskPosture: z.enum(["unknown", "conservative", "balanced", "bold"]).optional(),
  primaryCity: z.string().max(80).optional(),
  onboardingPhase: z.enum(["intake", "guided", "advanced"]).optional(),
  /** Mirrors local entry intent slug */
  bcEntryIntentId: z.string().max(64).optional(),
});

export type EliasPrefsEnvelope = z.infer<typeof eliasPrefsEnvelopeSchema>;

export function normalizePrefsEnvelope(mixed: Record<string, unknown>): Record<string, unknown> {
  const parsed = eliasPrefsEnvelopeSchema.safeParse(mixed);
  if (!parsed.success) return { ...mixed, _prefsPartial: true };
  return { ...mixed, ...parsed.data, _prefsEnvelopeVersion: 1 };
}
