export type MissionSeed = {
  slug: string;
  title: string;
  description: string;
  xpReward: number;
  bccReward: number;
  nftAchievementKey?: string;
  pathSlug?: string;
  sortOrder: number;
};

export const MISSION_SEEDS: MissionSeed[] = [
  {
    slug: "connect-wallet",
    title: "Connect Your Wallet",
    description: "Link your Solana wallet to start your builder journey.",
    xpReward: 50,
    bccReward: 10,
    sortOrder: 1,
  },
  {
    slug: "enroll-path",
    title: "Choose Your Path",
    description: "Enroll in one of the six builder learning paths.",
    xpReward: 100,
    bccReward: 25,
    sortOrder: 2,
  },
  {
    slug: "first-daily-mission",
    title: "Complete Your First Daily Mission",
    description: "Finish any mission and claim your first on-chain reward.",
    xpReward: 120,
    bccReward: 50,
    nftAchievementKey: "first-builder",
    sortOrder: 3,
  },
  {
    slug: "streak-3",
    title: "3-Day Streak",
    description: "Show up three days in a row and compound your momentum.",
    xpReward: 150,
    bccReward: 30,
    sortOrder: 4,
  },
  {
    slug: "ai-builder-intro",
    title: "AI Builder: Ship a Prototype",
    description: "Build and document your first AI prototype.",
    xpReward: 200,
    bccReward: 75,
    pathSlug: "ai-builder",
    sortOrder: 10,
  },
  {
    slug: "web3-builder-intro",
    title: "Web3 Builder: Deploy to Devnet",
    description: "Deploy a smart contract or Solana program to devnet.",
    xpReward: 200,
    bccReward: 75,
    pathSlug: "web3-builder",
    sortOrder: 11,
  },
  {
    slug: "community-builder-intro",
    title: "Community Builder: Launch Ritual",
    description: "Design and run your first community ritual.",
    xpReward: 200,
    bccReward: 75,
    pathSlug: "community-builder",
    sortOrder: 12,
  },
  {
    slug: "creator-builder-intro",
    title: "Creator Builder: Publish 5 Pieces",
    description: "Ship five pieces of content in your chosen format.",
    xpReward: 200,
    bccReward: 75,
    pathSlug: "creator-builder",
    sortOrder: 13,
  },
  {
    slug: "founder-builder-intro",
    title: "Founder Builder: Talk to 5 Users",
    description: "Complete five customer discovery conversations.",
    xpReward: 200,
    bccReward: 75,
    pathSlug: "founder-builder",
    sortOrder: 14,
  },
  {
    slug: "impact-builder-intro",
    title: "Impact Builder: Define Your Metric",
    description: "Write a one-page impact thesis with a measurable outcome.",
    xpReward: 200,
    bccReward: 75,
    pathSlug: "impact-builder",
    sortOrder: 15,
  },
  {
    slug: "path-capstone",
    title: "Path Capstone",
    description: "Complete your enrolled path capstone project.",
    xpReward: 500,
    bccReward: 200,
    nftAchievementKey: "path-capstone",
    sortOrder: 20,
  },
  {
    slug: "weekly-quest",
    title: "Weekly Quest",
    description: "Complete this week's builder quest.",
    xpReward: 80,
    bccReward: 20,
    sortOrder: 5,
  },
];
