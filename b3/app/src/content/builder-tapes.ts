import { BUILDER_PROFILE, BUILDER_WALLET } from "@/content/builder-chronicle";

/** Canonical playback URL — same-origin proxy with audio/mpeg + Range support. */
export function builderTapeAudioUrl(filename: string): string {
  return `/api/media/builder-tapes/${encodeURIComponent(filename)}`;
}

export const BUILDER_TAPES_SERIES_ID = "laszlo-founder";
export const BUILDER_TAPES_COMPLETE_ALL_SLUG = "builder-tapes-complete-all";
export const BUILDER_TAPE_LISTEN_POINTS = 20;
export const BUILDER_TAPES_COMPLETE_BONUS_POINTS = 50;
export const BUILDER_TAPE_LISTEN_THRESHOLD = 0.8;

export type BuilderTape = {
  slug: string;
  title: string;
  kicker: string;
  oneLiner: string;
  theme: string;
  audioUrl: string;
  /** Rough duration for UI before metadata loads (seconds). */
  durationEstimate?: number;
  coachSceneId: string;
  shareText: string;
  relatedChronicleIds?: string[];
  relatedStoryYear?: string;
  relatedHref?: string;
  order: number;
};

export const BUILDER_TAPES_SERIES = {
  id: BUILDER_TAPES_SERIES_ID,
  title: "Builder Tapes",
  subtitle: "Real stories from the dial-up era to onchain culture — told by Laszlo.",
  hubCta: "Pick an episode. Listen. Share the moment that hit you.",
  authorWallet: BUILDER_WALLET,
  authorCultureName: "laszlo.culture",
  authorDisplayName: BUILDER_PROFILE.legalName,
} as const;

export const BUILDER_TAPES: BuilderTape[] = [
  {
    slug: "dial-up-whispers",
    title: "Dial-Up Whispers",
    kicker: "Episode 1 · Origin",
    oneLiner: "Modems, curiosity, and the first time the web felt like a secret door.",
    theme: "90s internet",
    audioUrl: builderTapeAudioUrl("Dial-Up Whispers.mp3"),
    durationEstimate: 180,
    coachSceneId: "historical-vs",
    shareText:
      "Dial-up whispers — real builder tape from Laszlo on Building Culture. The web before crypto.",
    relatedChronicleIds: ["ch-01", "ch-02"],
    relatedStoryYear: "1996",
    order: 1,
  },
  {
    slug: "screen-glow-hope",
    title: "Screen-Glow Hope",
    kicker: "Episode 2 · Screens",
    oneLiner: "When the monitor was the campfire — optimism in the glow of building.",
    theme: "Optimism / screens",
    audioUrl: builderTapeAudioUrl("Screen-Glow Hope.mp3"),
    durationEstimate: 180,
    coachSceneId: "farm-vs-build",
    shareText:
      "Screen-glow hope — a real story from the builder years. Listen on Building Culture.",
    relatedChronicleIds: ["ch-03", "ch-04"],
    relatedStoryYear: "2000s",
    order: 2,
  },
  {
    slug: "bitcoin-whitepaper",
    title: "Bitcoin Whitepaper",
    kicker: "Episode 3 · Discovery",
    oneLiner: "The moment proof-of-work clicked — and everything after it.",
    theme: "Origin / discovery",
    audioUrl: builderTapeAudioUrl("Bitcoin Whitepaper.mp3"),
    durationEstimate: 210,
    coachSceneId: "early-legend",
    shareText: "Bitcoin whitepaper — founder tape on Building Culture. Real life, not myth.",
    relatedChronicleIds: ["ch-05", "ch-06"],
    relatedStoryYear: "2020s",
    order: 3,
  },
  {
    slug: "cathedral-builders",
    title: "Cathedral Builders",
    kicker: "Episode 4 · Long game",
    oneLiner: "Why culture compounds when you build for decades, not quarters.",
    theme: "Long-term building",
    audioUrl: builderTapeAudioUrl("Cathedral Builders.mp3"),
    durationEstimate: 210,
    coachSceneId: "reputation-upgrade",
    shareText:
      "Cathedral builders — long-horizon culture from Laszlo. Hear it on Building Culture.",
    relatedChronicleIds: ["ch-08", "ch-09"],
    relatedStoryYear: "Today",
    order: 4,
  },
  {
    slug: "builders-inherit",
    title: "Builders Inherit",
    kicker: "Episode 5 · Legacy",
    oneLiner: "What we leave behind when identity and proof travel onchain.",
    theme: "Legacy / inheritance",
    audioUrl: builderTapeAudioUrl("Builders Inherit.mp3"),
    durationEstimate: 210,
    coachSceneId: "vibe-friends",
    shareText: "Builders inherit — the last tape in the series. Real stories, onchain culture.",
    relatedChronicleIds: ["ch-10", "ch-11"],
    relatedStoryYear: "Today",
    relatedHref: "/legacy",
    order: 5,
  },
];

export function builderTapeListenTaskSlug(slug: string): string {
  return `builder-tape-listen-${slug}`;
}

export function getBuilderTape(slug: string): BuilderTape | undefined {
  return BUILDER_TAPES.find((t) => t.slug === slug);
}

export function builderTapeEpisodePath(slug: string): string {
  return `/stories/tapes/${slug}`;
}

export function countCompletedBuilderTapes(completedSlugs: string[]): number {
  return BUILDER_TAPES.filter((t) => completedSlugs.includes(builderTapeListenTaskSlug(t.slug)))
    .length;
}

export function allBuilderTapesCompleted(completedSlugs: string[]): boolean {
  return countCompletedBuilderTapes(completedSlugs) >= BUILDER_TAPES.length;
}

export function builderTapeForStoryYear(year: string): BuilderTape | undefined {
  return BUILDER_TAPES.find((t) => t.relatedStoryYear === year);
}

export function builderTapesForStoryYear(year: string): BuilderTape[] {
  return BUILDER_TAPES.filter((t) => t.relatedStoryYear === year);
}

export function builderTapesForChronicle(chapterId: string): BuilderTape[] {
  return BUILDER_TAPES.filter((t) => t.relatedChronicleIds?.includes(chapterId));
}
