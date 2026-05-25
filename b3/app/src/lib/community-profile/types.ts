export type SocialPlatform =
  | "twitter"
  | "linkedin"
  | "github"
  | "discord"
  | "telegram"
  | "instagram"
  | "youtube"
  | "farcaster"
  | "website"
  | "other";

export interface SocialLink {
  id?: number;
  platform: SocialPlatform;
  url: string;
  label?: string | null;
}

export type WalletChain = "evm" | "solana" | "sui" | "bitcoin";

export interface WalletLink {
  id?: number;
  chain: WalletChain;
  address: string;
  label?: string | null;
  verifiedAt?: string | null;
}

export interface ProfileVisibility {
  showWallets?: boolean;
  showActivity?: boolean;
  /** When false, detailed social list is hidden (hero strip may still show). */
  showSocialLinks?: boolean;
}

export interface StrapiMedia {
  id?: number;
  url?: string;
  alternativeText?: string | null;
  formats?: Record<string, { url?: string }>;
}

export interface CommunityProfile {
  id?: number;
  documentId?: string;
  slug: string;
  displayName: string;
  headline?: string | null;
  bio?: string | null;
  focusTags?: string | null;
  ownerMasked?: string | null;
  ownerAddress?: string | null;
  avatar?: StrapiMedia | null;
  cover?: StrapiMedia | null;
  gallery?: StrapiMedia[] | null;
  socialLinks?: SocialLink[] | null;
  walletLinks?: WalletLink[] | null;
  visibility?: ProfileVisibility | null;
  contactEnabled?: boolean | null;
  /** Human-readable ETH amount, e.g. "0.02". Empty or "0" = free contact when enabled. */
  contactPriceEth?: string | null;
  contactDestinationUrl?: string | null;
  contactIntro?: string | null;
}
