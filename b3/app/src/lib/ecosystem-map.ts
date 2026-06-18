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
    label: "Culture ID",
    href: "/pass",
    children: [
      { id: "culture", label: ".culture name", href: "/pass" },
      { id: "credentials", label: "Credentials", href: "/credentials" },
    ],
  },
  {
    id: "reputation",
    label: "Reputation",
    href: "/id/laszlo.culture/reputation",
    children: [
      { id: "score", label: "Culture Reputation", href: "/id/laszlo.culture/reputation" },
      { id: "leaderboard", label: "Leaderboard", href: "/credentials/leaderboard" },
    ],
  },
  {
    id: "opportunities",
    label: "Opportunities",
    href: "/play",
    children: [
      { id: "campaigns", label: "Campaign Hub", href: "/play" },
      { id: "forest", label: "Forest hub", href: "/forest" },
      { id: "studio", label: "BC Studio", href: "/studio" },
    ],
  },
  {
    id: "agents",
    label: "Agents",
    href: "/agent-os",
    children: [
      { id: "limx", label: "Limx Revenue Agent", href: "/agent-os#limx-agent" },
      { id: "grant", label: "Grant Agent", href: "/agent-os#grant-agent" },
      { id: "research", label: "Research Agent", href: "/agent-os#research-agent" },
    ],
  },
  {
    id: "economy",
    label: "Economy",
    href: "/marketplace",
    children: [
      { id: "marketplace", label: "Marketplace", href: "/marketplace" },
      { id: "bcc", label: "BCC", href: "/bcc" },
      { id: "creators", label: "Creator Hub", href: "/creators" },
    ],
  },
  {
    id: "impact",
    label: "Impact",
    href: "/earth",
    children: [
      { id: "earth", label: "Earth", href: "/earth" },
      { id: "places", label: "Places", href: "/places" },
      { id: "grant-proof", label: "Grant Proof", href: "/grant-proof" },
    ],
  },
];

export const NORTH_STAR_QUESTIONS = [
  { id: "who", question: "Who am I?", answer: "Culture ID + credentials", href: "/pass" },
  { id: "prove", question: "What can I prove?", answer: "Credential Center", href: "/credentials" },
  { id: "trust", question: "How trusted am I?", answer: "Culture Reputation", href: "/id/laszlo.culture/reputation" },
  { id: "opportunities", question: "What can I unlock?", answer: "Campaigns + forest access", href: "/play" },
  { id: "agents", question: "Who can help me?", answer: "Agent OS", href: "/agent-os" },
  { id: "earn", question: "What can I earn?", answer: "Culture Points → BCC", href: "/profile" },
] as const;
