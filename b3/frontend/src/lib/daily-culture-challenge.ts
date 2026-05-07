/** Deterministic daily snippet for habit / Elias orb surfacing — local XP via quest id. */

const LIBRARY: { title: string; body: string }[] = [
  {
    title: "Name one place we protect",
    body: "Tell someone (or Elias) why preserving a real venue matters more than a spreadsheet ticker.",
  },
  {
    title: "Trace a receipt",
    body: "Open your wallet profile and follow one on-chain link — ownership should feel legible, not hidden.",
  },
  {
    title: "Support culture visibly",
    body: "Share what we're building in one sentence: culture through places, proven onchain.",
  },
  {
    title: "Explore a property thread",
    body: "Pick a live drop or mission page and read one paragraph aloud — story before yield.",
  },
  {
    title: "Plan a visit lane",
    body: "Even if you can't travel yet, sketch the Vienna route you'd want Elias to refine — save it for /elias.",
  },
  {
    title: "Coach a friend through wallet setup",
    body: "Normalize self-custody calmly — no hype, just keys and meaning.",
  },
  {
    title: "Write your culture thesis",
    body: "Three bullets: what belongs you want in the world — save to notes.",
  },
];

function utcDayKey(now = Date.now()): string {
  const d = new Date(now);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, "0");
  const day = String(d.getUTCDate()).padStart(2, "0");
  return `${y}-${m}-${day}`;
}

/** Simple string hash → non-negative int */
function stableIndex(seed: string, mod: number): number {
  let h = 2166136261;
  for (let i = 0; i < seed.length; i++) {
    h ^= seed.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return Math.abs(h) % mod;
}

export function dailyCultureDayKey(now?: number): string {
  return utcDayKey(now ?? Date.now());
}

export function dailyCultureChallenge(now?: number): {
  dayKey: string;
  title: string;
  body: string;
  questId: string;
  xpReward: number;
} {
  const dayKey = dailyCultureDayKey(now);
  const pick = LIBRARY[stableIndex(dayKey, LIBRARY.length)];
  return {
    dayKey,
    title: pick.title,
    body: pick.body,
    questId: `culture_day_${dayKey}`,
    xpReward: 10,
  };
}
