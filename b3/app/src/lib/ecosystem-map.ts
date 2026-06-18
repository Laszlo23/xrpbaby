/**
 * Single 30-second ecosystem map — drives hero map and cross-links culture layers.
 * Keep in sync with culture-layers.ts pillar names.
 */

export type EcosystemMapNode = {
  id: string;
  label: string;
  href: string;
  children?: { id: string; label: string; href: string }[];
};

export const ECOSYSTEM_MAP: EcosystemMapNode[] = [
  {
    id: "identity",
    label: "Identity",
    href: "/pass",
    children: [{ id: "culture", label: ".culture", href: "/pass" }],
  },
  {
    id: "agents",
    label: "Agents",
    href: "/agent-os",
    children: [
      { id: "grant", label: "Grant Agent", href: "/agent-os#grant-agent" },
      { id: "builder", label: "Builder Agent", href: "/studio" },
      { id: "marketing", label: "Marketing Agent", href: "/agent-os" },
    ],
  },
  {
    id: "economy",
    label: "Economy",
    href: "/marketplace",
    children: [
      { id: "marketplace", label: "Marketplace", href: "/marketplace" },
      { id: "creators", label: "Creator Hub", href: "/creators" },
      { id: "shares", label: "Agent Shares", href: "/campaign" },
    ],
  },
  {
    id: "impact",
    label: "Impact",
    href: "/earth",
    children: [
      { id: "earth", label: "Earth", href: "/earth" },
      { id: "ankommen", label: "Ankommen", href: "https://ankommen.buildingcultureid.space" },
      { id: "forkids", label: "KinderStimme", href: "https://forkids.buildingcultureid.space" },
    ],
  },
  {
    id: "capital",
    label: "Capital",
    href: "/bcc",
    children: [{ id: "bcc", label: "BCC", href: "/bcc" }],
  },
];

export const NORTH_STAR_QUESTIONS = [
  { id: "who", question: "Who am I?", answer: ".culture + Culture Score", href: "/pass" },
  { id: "do", question: "What can I do?", answer: "Quests + Agents", href: "/forest/quests" },
  { id: "earn", question: "What can I earn?", answer: "Culture Points → BCC", href: "/profile" },
  { id: "build", question: "What can I build?", answer: "Studio + Grant Agent", href: "/studio" },
  { id: "help", question: "Who can help me?", answer: "Agent marketplace", href: "/agent-os" },
] as const;
