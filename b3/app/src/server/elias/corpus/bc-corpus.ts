/** Lightweight text chunks for MVP retrieval — expand over time / sync from CMS */

export type BcCorpusChunk = {
  id: string;
  title: string;
  tags: string[];
  body: string;
};

export const BC_CORPUS_CHUNKS: BcCorpusChunk[] = [
  {
    id: "mission_belief",
    title: "Why Building Culture exists",
    tags: ["mission", "culture", "places", "story", "why", "forgotten", "preserve", "belong"],
    body: `Building Culture reunites stewardship of real assets with culture.
We revive meaningful places—not as abstract portfolios, but as lived scenes:
community nights, residences, artworks, missions. Ownership is participatory:
onchain proofs, treasury clarity, missions for members. The slogan that guides us:
bring forgotten places back to life.`,
  },
  {
    id: "emotional_entry",
    title: "Belonging, not spreadsheets",
    tags: ["emotion", "narrative", "rwa", "community", "access", "culture"],
    body: `We position culture as emotionally legible—not “another RWA ticker.” Users join for status,
access to places, lore and collectibles tied to neighborhoods. Tokens and tickets finance and gate
experience; the protagonist is culture itself.`,
  },
  {
    id: "elias_role",
    title: "Elias — ecosystem operator",
    tags: ["elias", "ai", "concierge", "guide", "operator", "vienna"],
    body: `Elias is Building Culture's AI-native operator persona. Elias concierge mode plans Vienna stays through
preference capture and partner introductions. Orb mode answers ecosystem questions grounded in curated sources.
For sensitive booking flows, Elias directs to the concierge route.`,
  },
  {
    id: "bcd_economy",
    title: "BCD tokens & quests",
    tags: ["bcd", "token", "economy", "xp", "quest", "rewards"],
    body: `BCD anchors in-app economies: drops, ticketing, quests. Profiles track XP locally; Genesis claim is a
distinct merkle path. Sale flows activate when deployed. Always verify contract addresses via official env.`,
  },
  {
    id: "drops_truth",
    title: "Drops & on-chain fairness",
    tags: ["raffle", "tickets", "fair", "onchain", "pool", "odds"],
    body: `Raffle-style pools use on-chain settlement so odds and treasury flows are publicly auditable. Users should
follow explorer links tied to deployments on Base.`,
  },
  {
    id: "governance_notes",
    title: "DAO & treasury posture",
    tags: ["dao", "safe", "treasury", "multisig", "policy"],
    body: `High-impact treasury motions route through multisig safeguards described in treasury policy—not hot agents.
Elias can explain intent but cannot sign transactions.`,
  },
];
