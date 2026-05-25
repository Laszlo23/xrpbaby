export type TaskId =
  | "link_wallet"
  | "follow_official"
  | "cast_hashtag"
  | "mint_identity"
  | "share_mini"
  | "view_profile";

export type TaskDefinition = {
  id: TaskId;
  title: string;
  description: string;
  xp: number;
  ctaLabel?: string;
  requiresAction?: "compose" | "open_mint" | "open_profile";
};

export const TASK_CATALOG: TaskDefinition[] = [
  {
    id: "link_wallet",
    title: "Link your wallet",
    description: "Verify an Ethereum address on your Farcaster account.",
    xp: 25,
  },
  {
    id: "follow_official",
    title: "Follow Culture Layer",
    description: "Follow @buildingcultu3 on Farcaster.",
    xp: 50,
    ctaLabel: "Open Warpcast",
  },
  {
    id: "cast_hashtag",
    title: "Spread the word",
    description: "Post a cast with #BuildingCulture about your onchain identity.",
    xp: 75,
    ctaLabel: "Compose cast",
    requiresAction: "compose",
  },
  {
    id: "mint_identity",
    title: "Mint your identity",
    description: "Mint a .culture (or any TLD) identity NFT on Base.",
    xp: 150,
    ctaLabel: "Go mint",
    requiresAction: "open_mint",
  },
  {
    id: "share_mini",
    title: "Share the mini app",
    description: "Cast a link to this mini app for others to discover.",
    xp: 30,
    ctaLabel: "Share",
    requiresAction: "compose",
  },
  {
    id: "view_profile",
    title: "View your profile",
    description: "Open your onchain identity profile in the app.",
    xp: 20,
    ctaLabel: "My profile",
    requiresAction: "open_profile",
  },
];

export function getTaskById(id: string): TaskDefinition | undefined {
  return TASK_CATALOG.find((t) => t.id === id);
}
