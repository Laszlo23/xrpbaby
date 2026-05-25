export type EliasEntryIntent = {
  /** Stable ID stored in prefs / progress */
  id: string;
  label: string;
  teaser: string;
  /** Routes recommended after selection */
  routes: { to: string; label: string }[];
  /** optional related external touchpoint IDs from bc-touchpoints */
  touchpointHints?: string[];
};

export const ELIAS_ENTRY_INTENTS: EliasEntryIntent[] = [
  {
    id: "invest",
    label: "Invest & align",
    teaser: "Own culture with real stakes — not spreadsheets.",
    routes: [
      { to: "/mission", label: "Mission" },
      { to: "/marketplace", label: "Explore offerings" },
    ],
    touchpointHints: ["capital", "zero_x"],
  },
  {
    id: "explore",
    label: "Explore projects",
    teaser: "See places we revive and programmes we wire.",
    routes: [
      { to: "/campaigns", label: "Live drops" },
      { to: "/", label: "Home" },
    ],
  },
  {
    id: "play",
    label: "Play & collect",
    teaser: "Tickets, quests, rarity — belonging that scales.",
    routes: [
      { to: "/campaigns", label: "Mint & play" },
      { to: "/profile", label: "XP & quests" },
    ],
  },
  {
    id: "rewards",
    label: "Earn rewards",
    teaser: "Stack XP and daily rhythm while we ship.",
    routes: [
      { to: "/profile", label: "Profile & quests" },
      { to: "/", label: "Open app" },
    ],
  },
  {
    id: "vienna",
    label: "Discover Vienna",
    teaser: "Elias concierge for stays and culture routes.",
    routes: [
      { to: "/elias", label: "Elias concierge" },
      { to: "/faq", label: "FAQ" },
    ],
    touchpointHints: ["elias_concierge"],
  },
  {
    id: "culture",
    label: "Support culture",
    teaser: "We bring forgotten places back to life.",
    routes: [
      { to: "/mission", label: "Mission story" },
      { to: "/faq", label: "How it works" },
    ],
  },
  {
    id: "dao",
    label: "Join the DAO lane",
    teaser: "Participation, governance narrative, treasury posture.",
    routes: [
      { to: "/mission", label: "Mission" },
      { to: "/docs", label: "Docs hub" },
    ],
  },
  {
    id: "learn_chain",
    label: "Learn onchain basics",
    teaser: "Own receipts, proofs, wallets — calmly explained.",
    routes: [
      { to: "/faq", label: "FAQ" },
      { to: "/profile", label: "Connect & practice" },
    ],
  },
];

export function intentById(id: string): EliasEntryIntent | undefined {
  return ELIAS_ENTRY_INTENTS.find((i) => i.id === id);
}
