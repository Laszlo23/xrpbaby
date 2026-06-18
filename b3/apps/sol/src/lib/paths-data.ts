import { Brain, Hexagon, Users, Sparkles, Rocket, Heart, type LucideIcon } from "lucide-react";

export type FrequencyTrack = {
  name: string;
  hz: string;
  use: string;
  duration: string;
};

export type PathData = {
  slug: string;
  n: string;
  title: string;
  tagline: string;
  description: string;
  icon: LucideIcon;
  capstone: string;
  outcomes: string[];
  phases: { name: string; weeks: string; focus: string; deliverable: string }[];
  liveCalls: { day: string; name: string; format: string }[];
  vault: {
    links: { label: string; count: number }[];
    templates: string[];
    audio: FrequencyTrack[];
  };
};

const BASE_FREQUENCIES: FrequencyTrack[] = [
  { name: "Focus", hz: "40 Hz Gamma", use: "Deep work, coding, writing", duration: "60 min" },
  { name: "Flow", hz: "10 Hz Alpha", use: "Creative building, design", duration: "45 min" },
  { name: "Recovery", hz: "6 Hz Theta", use: "Post-session reset, journaling", duration: "20 min" },
  { name: "Sleep", hz: "2 Hz Delta", use: "Wind-down + integration", duration: "30 min" },
];

export const PATHS: PathData[] = [
  {
    slug: "ai-builder",
    n: "01",
    title: "AI Builder",
    tagline: "Ship apps, agents and automations.",
    description:
      "Go from prompting to production. You'll build, deploy and monetize AI tools that solve real problems for real users.",
    icon: Brain,
    capstone: "Launch an AI agent or app with at least 3 paying users.",
    outcomes: [
      "Ship 3 working AI prototypes",
      "Deploy 1 production agent",
      "Land first paying user",
      "Public AI portfolio + builder profile",
    ],
    phases: [
      {
        name: "Foundations",
        weeks: "Weeks 1–4",
        focus: "Prompting, models, embeddings, eval",
        deliverable: "First working prompt-engine prototype",
      },
      {
        name: "Build",
        weeks: "Weeks 5–8",
        focus: "Agents, tools, RAG, evaluation loops",
        deliverable: "A working agent with real workflow",
      },
      {
        name: "Ship",
        weeks: "Weeks 9–12",
        focus: "Pricing, distribution, deployment",
        deliverable: "Launched product + 3 paying users",
      },
    ],
    liveCalls: [
      { day: "Tuesday · 18:00 UTC", name: "Teaching Call", format: "Live build + Q&A with mentor" },
      {
        day: "Thursday · 16:00 UTC",
        name: "Co-Building Lab",
        format: "2h work session with the cohort",
      },
    ],
    vault: {
      links: [
        { label: "Curated videos", count: 24 },
        { label: "Essential papers", count: 12 },
        { label: "Tool stack", count: 18 },
        { label: "Prompt library", count: 60 },
      ],
      templates: ["Agent starter repo", "RAG boilerplate", "Eval harness", "Launch checklist"],
      audio: BASE_FREQUENCIES,
    },
  },
  {
    slug: "web3-builder",
    n: "02",
    title: "Web3 Builder",
    tagline: "Smart contracts, DAOs, and protocols.",
    description:
      "Master the on-chain stack. Build, audit, and deploy contracts. Launch tokens, govern DAOs, and ship protocols people actually use.",
    icon: Hexagon,
    capstone: "Deploy a verified contract + run a small DAO or token launch.",
    outcomes: [
      "Deploy contracts to mainnet",
      "Pass a peer security review",
      "Launch a token or DAO experiment",
      "On-chain builder reputation NFT",
    ],
    phases: [
      {
        name: "Foundations",
        weeks: "Weeks 1–4",
        focus: "Solidity, EVM, testing, wallets",
        deliverable: "Verified test-net contract",
      },
      {
        name: "Build",
        weeks: "Weeks 5–8",
        focus: "DeFi primitives, NFTs, governance, security",
        deliverable: "Audited protocol prototype",
      },
      {
        name: "Ship",
        weeks: "Weeks 9–12",
        focus: "Mainnet launch, liquidity, community",
        deliverable: "Live token / DAO with users",
      },
    ],
    liveCalls: [
      {
        day: "Tuesday · 18:00 UTC",
        name: "Protocol Deep Dive",
        format: "Code-along with a senior dev",
      },
      {
        day: "Thursday · 16:00 UTC",
        name: "Security Review Lab",
        format: "Audit each other's contracts live",
      },
    ],
    vault: {
      links: [
        { label: "Curated tutorials", count: 22 },
        { label: "Protocol whitepapers", count: 15 },
        { label: "Audit reports library", count: 30 },
        { label: "Tool stack", count: 20 },
      ],
      templates: [
        "Foundry starter",
        "ERC-20/721/1155 templates",
        "DAO scaffold",
        "Audit checklist",
      ],
      audio: BASE_FREQUENCIES,
    },
  },
  {
    slug: "community-builder",
    n: "03",
    title: "Community Builder",
    tagline: "Grow tribes that outlast platforms.",
    description:
      "Architect the kind of community people refuse to leave. Learn rituals, retention, moderation, and monetization from operators running 100k+ tribes.",
    icon: Users,
    capstone: "Launch a 100-member community with measured weekly retention.",
    outcomes: [
      "Define your community thesis",
      "Onboard first 100 members",
      "Establish weekly rituals",
      "Reach 60%+ monthly retention",
    ],
    phases: [
      {
        name: "Foundations",
        weeks: "Weeks 1–4",
        focus: "Positioning, hosts, rituals, platforms",
        deliverable: "Community blueprint + first 10 members",
      },
      {
        name: "Build",
        weeks: "Weeks 5–8",
        focus: "Programming, moderation, events",
        deliverable: "Active weekly rhythm",
      },
      {
        name: "Ship",
        weeks: "Weeks 9–12",
        focus: "Monetization, partnerships, leadership",
        deliverable: "100 active members + revenue test",
      },
    ],
    liveCalls: [
      {
        day: "Tuesday · 18:00 UTC",
        name: "Operator Teaching",
        format: "Frameworks from successful community ops",
      },
      {
        day: "Thursday · 16:00 UTC",
        name: "Hot-Seat Lab",
        format: "Live coaching on your community",
      },
    ],
    vault: {
      links: [
        { label: "Case studies", count: 18 },
        { label: "Ritual playbooks", count: 14 },
        { label: "Tool stack", count: 16 },
        { label: "Moderation guides", count: 10 },
      ],
      templates: [
        "Onboarding flow",
        "Event run-of-show",
        "Moderation policy",
        "Retention dashboard",
      ],
      audio: BASE_FREQUENCIES,
    },
  },
  {
    slug: "creator-builder",
    n: "04",
    title: "Creator Builder",
    tagline: "Turn taste into audience and income.",
    description:
      "Build a creative engine that pays. Voice, format, distribution, and monetization — without burning out or selling your soul.",
    icon: Sparkles,
    capstone: "Reach a monetized audience (newsletter, channel, or product).",
    outcomes: [
      "Lock your niche and voice",
      "Ship 30 pieces of content",
      "Grow first 1,000 true fans",
      "Open your first revenue stream",
    ],
    phases: [
      {
        name: "Foundations",
        weeks: "Weeks 1–4",
        focus: "Positioning, voice, format, tools",
        deliverable: "Publishing system live",
      },
      {
        name: "Build",
        weeks: "Weeks 5–8",
        focus: "Hooks, series, distribution, repurposing",
        deliverable: "Repeatable content engine",
      },
      {
        name: "Ship",
        weeks: "Weeks 9–12",
        focus: "Monetization: products, sponsors, paid community",
        deliverable: "First revenue from your audience",
      },
    ],
    liveCalls: [
      {
        day: "Tuesday · 18:00 UTC",
        name: "Creator Teaching",
        format: "Tactics from working creators",
      },
      {
        day: "Thursday · 16:00 UTC",
        name: "Edit & Ship Lab",
        format: "Live edits + accountability shipping",
      },
    ],
    vault: {
      links: [
        { label: "Best-of essays", count: 25 },
        { label: "Editing tutorials", count: 18 },
        { label: "Tool stack", count: 22 },
        { label: "Monetization guides", count: 12 },
      ],
      templates: [
        "Content OS (Notion)",
        "Hook library",
        "Sponsor pitch deck",
        "Product launch plan",
      ],
      audio: BASE_FREQUENCIES,
    },
  },
  {
    slug: "founder-builder",
    n: "05",
    title: "Founder Builder",
    tagline: "Validate, launch, and scale companies.",
    description:
      "Stop dreaming about startups. Validate a real problem, talk to customers, ship an MVP, and find product-market fit.",
    icon: Rocket,
    capstone: "Validated startup with revenue or a pre-seed round.",
    outcomes: [
      "Run 30 customer discovery calls",
      "Ship MVP in public",
      "First paying customers",
      "Investor-ready pitch + metrics",
    ],
    phases: [
      {
        name: "Foundations",
        weeks: "Weeks 1–4",
        focus: "Problem discovery, market, positioning",
        deliverable: "Validated problem + ICP",
      },
      {
        name: "Build",
        weeks: "Weeks 5–8",
        focus: "MVP, pricing, GTM, sales motion",
        deliverable: "First 5 paying customers",
      },
      {
        name: "Ship",
        weeks: "Weeks 9–12",
        focus: "Metrics, fundraising, hiring, scale",
        deliverable: "Pitch deck + traction",
      },
    ],
    liveCalls: [
      {
        day: "Tuesday · 18:00 UTC",
        name: "Founder Teaching",
        format: "Operators + investors on the call",
      },
      {
        day: "Thursday · 16:00 UTC",
        name: "Pitch & Metrics Lab",
        format: "Pitch your week, ship your week",
      },
    ],
    vault: {
      links: [
        { label: "Founder essays", count: 26 },
        { label: "Pitch deck library", count: 14 },
        { label: "Tool stack", count: 24 },
        { label: "Investor lists", count: 8 },
      ],
      templates: ["Discovery script", "MVP scope doc", "Pricing calc", "Pitch deck v0"],
      audio: BASE_FREQUENCIES,
    },
  },
  {
    slug: "impact-builder",
    n: "06",
    title: "Impact Builder",
    tagline: "Solve real problems in the real world.",
    description:
      "Build projects that matter — health, education, climate, civic. Combine systems thinking, capital, and tech to move actual metrics.",
    icon: Heart,
    capstone: "Project solving a measurable real-world problem with first beneficiaries.",
    outcomes: [
      "Choose a problem + measurable metric",
      "Map the system + stakeholders",
      "Ship a pilot",
      "Document outcomes + scale plan",
    ],
    phases: [
      {
        name: "Foundations",
        weeks: "Weeks 1–4",
        focus: "Problem framing, systems mapping, theory of change",
        deliverable: "1-page impact thesis",
      },
      {
        name: "Build",
        weeks: "Weeks 5–8",
        focus: "Pilot design, partnerships, measurement",
        deliverable: "Pilot running with users",
      },
      {
        name: "Ship",
        weeks: "Weeks 9–12",
        focus: "Funding, governance, scale",
        deliverable: "Outcome report + scale plan",
      },
    ],
    liveCalls: [
      {
        day: "Tuesday · 18:00 UTC",
        name: "Impact Teaching",
        format: "Practitioners from the field",
      },
      {
        day: "Thursday · 16:00 UTC",
        name: "Pilot Lab",
        format: "Cohort review of pilots in flight",
      },
    ],
    vault: {
      links: [
        { label: "Field reports", count: 20 },
        { label: "Funding sources", count: 16 },
        { label: "Tool stack", count: 14 },
        { label: "Measurement guides", count: 10 },
      ],
      templates: ["Theory of change", "Pilot plan", "Funder one-pager", "Outcome report"],
      audio: BASE_FREQUENCIES,
    },
  },
];

export const getPath = (slug: string) => PATHS.find((p) => p.slug === slug);
