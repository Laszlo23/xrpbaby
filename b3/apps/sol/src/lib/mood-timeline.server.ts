import type { MoodCheckIn } from "@/generated/prisma/client";
import { resolveMoodOption, type MoodTimelinePoint } from "@/lib/mood-data";

export type { MoodTimelinePoint };

export function formatMoodCheckIn(row: MoodCheckIn): MoodTimelinePoint {
  const energy = row.energySlug ? resolveMoodOption("energy", row.energySlug) : undefined;
  const inner = row.innerSlug ? resolveMoodOption("inner", row.innerSlug) : undefined;
  const momentum = row.momentumSlug ? resolveMoodOption("momentum", row.momentumSlug) : undefined;

  return {
    programDay: row.programDay,
    energyScore: row.energyScore,
    energySlug: row.energySlug,
    energyEmoji: energy?.emoji ?? null,
    energyLabel: energy?.label ?? null,
    innerScore: row.innerScore,
    innerSlug: row.innerSlug,
    innerEmoji: inner?.emoji ?? null,
    innerLabel: inner?.label ?? null,
    momentumScore: row.momentumScore,
    momentumSlug: row.momentumSlug,
    momentumEmoji: momentum?.emoji ?? null,
    momentumLabel: momentum?.label ?? null,
    morningDone: row.morningAt != null,
    eveningDone: row.eveningAt != null,
  };
}
