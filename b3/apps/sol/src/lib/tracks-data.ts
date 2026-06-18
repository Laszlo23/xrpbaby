import { Brain, Heart, Moon, Sparkles, Sun, Waves, type LucideIcon } from "lucide-react";

export type TrackData = {
  slug: string;
  n: string;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  outcomes: string[];
};

export const TRACKS: TrackData[] = [
  {
    slug: "sober-reset",
    n: "01",
    title: "Sober Reset",
    tagline: "Clear mind. Clean body. New chapter.",
    description:
      "A structured 90-day identity shift for people leaving old habits behind — alcohol, noise, chaos, or whatever kept you small.",
    icon: Moon,
    outcomes: [
      "Morning clarity ritual (10 min)",
      "Trigger map + replacement protocol",
      "Weekly accountability check-in",
      "Identity statement you actually believe",
    ],
  },
  {
    slug: "new-identity",
    n: "02",
    title: "New Identity",
    tagline: "Become someone your past self wouldn't recognize.",
    description:
      "Rewrite who you are in public and private — voice, style, standards, and the story you tell yourself daily.",
    icon: Sparkles,
    outcomes: [
      "Personal brand of one worksheet",
      "30-day visibility challenge",
      "Boundary scripts for real life",
      "New-name / new-energy ceremony",
    ],
  },
  {
    slug: "disciplined-self",
    n: "03",
    title: "Disciplined Self",
    tagline: "Structure beats motivation. Every time.",
    description:
      "Install non-negotiables: sleep, movement, focus blocks, and a calendar that protects the person you're becoming.",
    icon: Sun,
    outcomes: [
      "Non-negotiable habit stack",
      "Weekly time architecture",
      "Distraction detox (7 days)",
      "Accountability partner match",
    ],
  },
  {
    slug: "clarity-mind",
    n: "04",
    title: "Clarity Mind",
    tagline: "Quiet the noise. Hear yourself again.",
    description:
      "Meditation, breathwork, journaling, and cognitive resets designed for people who've been running on fumes.",
    icon: Brain,
    outcomes: [
      "Daily 12-minute clarity session",
      "Thought download template",
      "Decision framework (no more spiraling)",
      "Monthly mind audit",
    ],
  },
  {
    slug: "calm-presence",
    n: "05",
    title: "Calm Presence",
    tagline: "Respond, don't react. Lead your household.",
    description:
      "Emotional regulation, nervous-system repair, and presence practices for parents, partners, and leaders at home.",
    icon: Waves,
    outcomes: [
      "Pause protocol before conflict",
      "Evening decompression ritual",
      "Family meeting template",
      "Stress thermometer toolkit",
    ],
  },
  {
    slug: "purpose-path",
    n: "06",
    title: "Purpose Path",
    tagline: "Money follows alignment — not the other way around.",
    description:
      "Find what you're here to do, package it simply, and start earning without selling your soul or your friends.",
    icon: Heart,
    outcomes: [
      "Purpose statement (1 page)",
      "Offer sketch you can sell this week",
      "Partner income playbook intro",
      "First $100 action plan",
    ],
  },
];

export const getTrack = (slug: string) => TRACKS.find((t) => t.slug === slug);

export const COMMISSION_RATES = [
  { level: 1, label: "Direct partner", rate: 0.3 },
  { level: 2, label: "Level 2", rate: 0.1 },
  { level: 3, label: "Level 3", rate: 0.05 },
] as const;

export const PLAN_PRICES_CENTS = {
  TRIAL: 0,
  MONTHLY: 1900,
  LIFETIME: 19900,
} as const;
