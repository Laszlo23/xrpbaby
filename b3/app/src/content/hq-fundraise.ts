import { HQ_FUNDRAISE_GOAL_USD } from "@/lib/packs";

export type HqMilestone = {
  id: string;
  label: string;
  percent: number;
  description: string;
};

export type HqAmenity = {
  label: string;
  detail: string;
};

export const HQ_MILESTONES: HqMilestone[] = [
  {
    id: "lease",
    label: "Lease signed",
    percent: 25,
    description: "Deposit + first month on a 3 bed / 2 bath terrace condo.",
  },
  {
    id: "fitout",
    label: "Cowork fit-out",
    percent: 50,
    description: "Desks, kitchen, terrace furniture, and fast internet.",
  },
  {
    id: "open",
    label: "Open HQ",
    percent: 75,
    description: "Builders can book stay nights and cowork weeks.",
  },
  {
    id: "full",
    label: "Fully funded",
    percent: 100,
    description: `$${HQ_FUNDRAISE_GOAL_USD.toLocaleString("en-US")} — live/work/host rhythm unlocked.`,
  },
];

export const HQ_AMENITIES: HqAmenity[] = [
  { label: "3 bedrooms", detail: "Sleep, ship, and host visiting builders." },
  { label: "2 baths", detail: "Shared live/work hygiene for longer stays." },
  { label: "Terrace", detail: "Outdoor calls, dinners, and sunset standups." },
  { label: "Cowork floor", detail: "Open desks + focus corners for deep work." },
  { label: "Kitchen", detail: "Cook together — culture happens between commits." },
];

export const HQ_COPY = {
  title: "Culture HQ 77777",
  tagline: "A terrace, a kitchen, and a room where builders sleep, ship, and host.",
  goalUsd: HQ_FUNDRAISE_GOAL_USD,
  thesis: [
    "We're raising for a physical headquarters — not another slide deck.",
    "3 bedrooms, 2 baths, a big outdoor terrace, cowork space, and a kitchen built for share-live-stay.",
    "Backers receive stay credits and Culture Points — not equity or yield.",
  ],
  disclaimer:
    "Rewards-based crowdfunding for operational HQ perks. Not a securities offering. Availability depends on lease and local law.",
} as const;
