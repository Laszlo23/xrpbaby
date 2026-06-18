export const MOOD_SCALE_SIZE = 9;

export type MoodOption = {
  slug: string;
  emoji: string;
  label: string;
  value: number;
};

export type MoodDimension = "energy" | "inner" | "momentum";

export const MOOD_QUESTIONS = {
  morning: "What's your starting energy?",
  eveningInner: "What was your inner weather today?",
  eveningMomentum: "How did the build go today?",
} as const;

export const ENERGY_SCALE: MoodOption[] = [
  { slug: "exhausted", emoji: "😴", label: "Exhausted", value: 1 },
  { slug: "sleepy", emoji: "🥱", label: "Sleepy", value: 2 },
  { slug: "flat", emoji: "😐", label: "Flat", value: 3 },
  { slug: "okay", emoji: "🙂", label: "Okay", value: 4 },
  { slug: "steady", emoji: "😊", label: "Steady", value: 5 },
  { slug: "charged", emoji: "⚡", label: "Charged", value: 6 },
  { slug: "fired-up", emoji: "🔥", label: "Fired up", value: 7 },
  { slug: "rocket", emoji: "🚀", label: "Rocket", value: 8 },
  { slug: "dawn", emoji: "🌅", label: "New dawn", value: 9 },
];

export const INNER_SCALE: MoodOption[] = [
  { slug: "chaotic", emoji: "🌪️", label: "Chaotic", value: 1 },
  { slug: "frustrated", emoji: "😤", label: "Frustrated", value: 2 },
  { slug: "melted", emoji: "🫠", label: "Melted", value: 3 },
  { slug: "numb", emoji: "😶", label: "Numb", value: 4 },
  { slug: "heavy", emoji: "🌧️", label: "Heavy", value: 5 },
  { slug: "growing", emoji: "🌱", label: "Growing", value: 6 },
  { slug: "lit", emoji: "✨", label: "Lit", value: 7 },
  { slug: "creative", emoji: "🎨", label: "Creative", value: 8 },
  { slug: "calm", emoji: "🕊️", label: "Calm", value: 9 },
];

export const MOMENTUM_SCALE: MoodOption[] = [
  { slug: "blocked", emoji: "🧱", label: "Blocked", value: 1 },
  { slug: "stuck", emoji: "⛔", label: "Stuck", value: 2 },
  { slug: "spinning", emoji: "🔄", label: "Spinning", value: 3 },
  { slug: "slipping", emoji: "📉", label: "Slipping", value: 4 },
  { slug: "flat", emoji: "😐", label: "Flat", value: 5 },
  { slug: "progress", emoji: "📈", label: "Progress", value: 6 },
  { slug: "shipped", emoji: "✅", label: "Shipped", value: 7 },
  { slug: "focused", emoji: "🎯", label: "Focused", value: 8 },
  { slug: "win", emoji: "🏆", label: "Win", value: 9 },
];

const SCALES: Record<MoodDimension, MoodOption[]> = {
  energy: ENERGY_SCALE,
  inner: INNER_SCALE,
  momentum: MOMENTUM_SCALE,
};

export function getMoodScale(dimension: MoodDimension): MoodOption[] {
  return SCALES[dimension];
}

export function resolveMoodOption(
  dimension: MoodDimension,
  slug: string,
): MoodOption | undefined {
  return SCALES[dimension].find((o) => o.slug === slug);
}

export function getMoodOptionBySlug(
  slug: string,
): (MoodOption & { dimension: MoodDimension }) | undefined {
  for (const dimension of Object.keys(SCALES) as MoodDimension[]) {
    const option = resolveMoodOption(dimension, slug);
    if (option) return { ...option, dimension };
  }
  return undefined;
}

export const CHART_LINE_META = {
  energy: { label: "Energy", color: "hsl(var(--signal))" },
  inner: { label: "Inner weather", color: "hsl(210 70% 55%)" },
  momentum: { label: "Build momentum", color: "hsl(35 90% 55%)" },
} as const;

export type MoodTimelinePoint = {
  programDay: number;
  energyScore: number | null;
  energySlug: string | null;
  energyEmoji: string | null;
  energyLabel: string | null;
  innerScore: number | null;
  innerSlug: string | null;
  innerEmoji: string | null;
  innerLabel: string | null;
  momentumScore: number | null;
  momentumSlug: string | null;
  momentumEmoji: string | null;
  momentumLabel: string | null;
  morningDone: boolean;
  eveningDone: boolean;
};
