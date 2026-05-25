export type LevelInfo = {
  level: number;
  title: string;
  xpForLevel: number;
  xpToNext: number;
};

const LEVELS: Array<{ minXp: number; title: string }> = [
  { minXp: 0, title: "Newcomer" },
  { minXp: 50, title: "Explorer" },
  { minXp: 120, title: "Builder" },
  { minXp: 220, title: "Culture Native" },
  { minXp: 350, title: "Identity Holder" },
  { minXp: 500, title: "Community Voice" },
  { minXp: 700, title: "Culture Advocate" },
  { minXp: 950, title: "Founding Spirit" },
  { minXp: 1250, title: "Layer Pioneer" },
  { minXp: 1600, title: "Culture Founder" },
];

export function levelFromXp(xp: number): LevelInfo {
  let level = 1;
  let title = LEVELS[0]!.title;
  let xpForLevel = 0;
  let nextThreshold = LEVELS[1]?.minXp ?? LEVELS[0]!.minXp + 100;

  for (let i = LEVELS.length - 1; i >= 0; i--) {
    if (xp >= LEVELS[i]!.minXp) {
      level = i + 1;
      title = LEVELS[i]!.title;
      xpForLevel = LEVELS[i]!.minXp;
      nextThreshold = LEVELS[i + 1]?.minXp ?? LEVELS[i]!.minXp + 200;
      break;
    }
  }

  return {
    level,
    title,
    xpForLevel,
    xpToNext: Math.max(0, nextThreshold - xp),
  };
}

export function xpProgressPercent(xp: number): number {
  const { xpForLevel, xpToNext } = levelFromXp(xp);
  const span = xpToNext + (xp - xpForLevel);
  if (span <= 0) return 100;
  return Math.min(100, Math.round(((xp - xpForLevel) / span) * 100));
}
