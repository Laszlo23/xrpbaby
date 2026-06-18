export type IdentityGraphLink = {
  link: string;
  handle: string;
};

export type IdentityGraphNode = {
  id: string;
  platform: string;
  identity: string;
  address: string | null;
  displayName: string;
  avatar: string | null;
  description: string | null;
  followerCount: number | null;
  links: Record<string, IdentityGraphLink>;
  isPrimary?: boolean;
};

export type CultureIdentityGraph = {
  ok: true;
  source: "web3bio";
  primaryNode: IdentityGraphNode | null;
  graph: IdentityGraphNode[];
  wallets: string[];
  platformCounts: Record<string, number>;
  totalFollowers: number;
  verifiedLinkCount: number;
  fetchedAt: string;
};

export type MemberProfileBridge = {
  farcasterUsername: string | null;
  supportScore: number | null;
  culturePoints: number;
  supporterTier: string;
  /** Completed task slugs from PointLedger */
  completedQuestCount?: number;
  /** Referral task completions (raffle-referral-bonus) */
  referralCount?: number;
  /** Studio / builder task completions */
  buildCount?: number;
  /** Agent calls logged for this wallet */
  agentUseCount?: number;
};

export type Web3BioCredential = {
  platform: string;
  category: string;
  label: string;
  description: string | null;
  value: string | null;
  link: string | null;
};

export type Web3BioCredentials = {
  isHuman: Web3BioCredential[];
  isRisky: Web3BioCredential[];
  isSpam: Web3BioCredential[];
};

export type Web3BioWalletBundle = {
  displayName: string | null;
  avatar: string | null;
  description: string | null;
  domains: IdentityGraphNode[];
  credentials: Web3BioCredentials;
  graph: IdentityGraphNode[];
};

export const PLATFORM_LABELS: Record<string, string> = {
  ens: "ENS",
  farcaster: "Farcaster",
  lens: "Lens",
  basenames: "Basenames",
  linea: "Linea",
  ethereum: "Ethereum",
  twitter: "X",
  solana: "Solana",
  culture: "Culture Layer",
};

export function platformLabel(platform: string): string {
  return PLATFORM_LABELS[platform.toLowerCase()] ?? platform;
}

export function identityGraphNodeUrl(node: IdentityGraphNode): string | null {
  const platform = node.platform.toLowerCase();
  const platformLink = node.links[platform]?.link ?? node.links.farcaster?.link;
  if (platformLink) return platformLink;

  switch (platform) {
    case "farcaster":
      return `https://farcaster.xyz/${node.identity}`;
    case "ens":
      return `https://app.ens.domains/${node.identity}`;
    case "lens":
      return `https://hey.xyz/${node.identity}`;
    case "basenames":
      return `https://www.base.org/name/${node.identity}`;
    case "linea":
      return `https://names.linea.build/${node.identity}`;
    case "twitter":
      return node.links.twitter?.link ?? `https://x.com/${node.identity}`;
    default:
      return null;
  }
}
