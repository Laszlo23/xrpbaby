/** Preset messages for Elias orb — exactly three taps (mobile-first). */

export type EliasOrbQuickPrompt = {
  id: string;
  label: string;
  message: string;
};

/** Keep length === 3 — product asks for a minimal multiple-choice intro */
export const ELIAS_ORB_QUICK_PROMPTS: EliasOrbQuickPrompt[] = [
  {
    id: "why_here",
    label: "Why does this exist?",
    message:
      "In two short paragraphs: why does Building Culture exist, and what makes it different from a typical real-estate or RWA pitch?",
  },
  {
    id: "start_here",
    label: "Where do I start?",
    message:
      "I'm new — what's the best order to explore? Give me 3 concrete steps with in-app paths from your touchpoints list.",
  },
  {
    id: "drops_play",
    label: "Drops & tickets",
    message:
      "How do drops and raffle tickets work here, and where in the app should I go to participate?",
  },
];
