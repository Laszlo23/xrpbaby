import { fmtProofInt, fmtProofPrice, fmtProofUsd } from "@/lib/public-proof-format";
import type { PublicProofStats } from "@/server/public/proof";

export type ProofSignalKey =
  | "members"
  | "membersWithWallet"
  | "membersWithFarcaster"
  | "bccHolders"
  | "bccPrice"
  | "bccMarketCap"
  | "bccLiquidity"
  | "bccVolume24h"
  | "raffleTickets"
  | "agentShareMints"
  | "waitlist"
  | "culturePoints"
  | "activity24h"
  | "marketplaceListings"
  | "verifiedSocialLinks"
  | "packPurchases";

export type ProofSignalSection = "problem" | "impact" | "ticker" | "bcc" | "stats";

export type ProofSignalDef = {
  key: ProofSignalKey;
  label: string;
  note: string;
  location: string;
  sections: ProofSignalSection[];
};

/** Every public number maps to a verifiable source — no marketing placeholders. */
export const PROOF_SIGNALS: readonly ProofSignalDef[] = [
  {
    key: "members",
    label: "Members",
    note: "Postgres Member rows — cumulative sign-ups",
    location: "App · DB",
    sections: ["problem", "impact", "ticker", "stats"],
  },
  {
    key: "membersWithWallet",
    label: "Contributors",
    note: "Members with wallet connected — active participants",
    location: "App · DB",
    sections: ["problem", "stats"],
  },
  {
    key: "membersWithFarcaster",
    label: "Farcaster-linked",
    note: "Member rows with FID stored",
    location: "App · DB",
    sections: ["problem"],
  },
  {
    key: "bccHolders",
    label: "$BCC holders",
    note: "Blockscout token_holders_count on Base",
    location: "Base · on-chain",
    sections: ["problem", "impact", "ticker", "bcc"],
  },
  {
    key: "bccPrice",
    label: "$BCC price",
    note: "DexScreener best BCC/WETH pool",
    location: "DexScreener",
    sections: ["ticker", "bcc"],
  },
  {
    key: "bccMarketCap",
    label: "$BCC market cap",
    note: "DexScreener reported market cap",
    location: "DexScreener",
    sections: ["problem", "bcc"],
  },
  {
    key: "bccLiquidity",
    label: "DEX liquidity",
    note: "Combined Uniswap/Aerodrome pool TVL",
    location: "DexScreener",
    sections: ["bcc"],
  },
  {
    key: "bccVolume24h",
    label: "DEX volume (24h)",
    note: "Pool trading volume — not platform revenue",
    location: "DexScreener",
    sections: ["bcc"],
  },
  {
    key: "raffleTickets",
    label: "Campaign tickets",
    note: "RaffleTicketCampaign.totalSupply() on Base",
    location: "Raffle · Base",
    sections: ["problem", "impact", "ticker", "stats"],
  },
  {
    key: "agentShareMints",
    label: "Grant milestones",
    note: "AgentShareCampaign.totalSupply() on Base",
    location: "Base · on-chain",
    sections: ["problem", "stats"],
  },
  {
    key: "waitlist",
    label: "Waitlist signups",
    note: "WaitlistEntry table count",
    location: "App · DB",
    sections: ["impact"],
  },
  {
    key: "culturePoints",
    label: "Reputation points",
    note: "Sum of PointLedger.delta (Culture Points net)",
    location: "App · DB",
    sections: ["problem", "ticker", "stats"],
  },
  {
    key: "activity24h",
    label: "Onchain actions (24h)",
    note: "ActivityEvent rows in last 24 hours",
    location: "App · DB",
    sections: ["problem", "stats"],
  },
  {
    key: "marketplaceListings",
    label: "Marketplace listings",
    note: "Active thirdweb listings on Base",
    location: "Marketplace API",
    sections: ["problem"],
  },
  {
    key: "verifiedSocialLinks",
    label: "Verified social links",
    note: "SocialAccount.verified=true across platforms",
    location: "App · DB",
    sections: ["problem"],
  },
  {
    key: "packPurchases",
    label: "Pack purchases",
    note: "PackPurchase rows (Stripe checkout)",
    location: "App · DB",
    sections: ["problem"],
  },
] as const;

export function proofSignalsFor(section: ProofSignalSection): ProofSignalDef[] {
  return PROOF_SIGNALS.filter((s) => s.sections.includes(section));
}

export function proofSignalValue(
  key: ProofSignalKey,
  proof: PublicProofStats | undefined,
  loading: boolean,
): string {
  if (loading || !proof) return "…";
  switch (key) {
    case "members":
      return fmtProofInt(proof.community.members);
    case "membersWithWallet":
      return fmtProofInt(proof.community.membersWithWallet);
    case "membersWithFarcaster":
      return fmtProofInt(proof.community.membersWithFarcaster);
    case "bccHolders":
      return fmtProofInt(proof.bcc.holders);
    case "bccPrice":
      return fmtProofPrice(proof.bcc.priceUsd);
    case "bccMarketCap":
      return fmtProofUsd(proof.bcc.marketCapUsd);
    case "bccLiquidity":
      return fmtProofUsd(proof.bcc.liquidityUsd);
    case "bccVolume24h":
      return fmtProofUsd(proof.bcc.volume24hUsd);
    case "raffleTickets":
      return fmtProofInt(proof.game.raffleTicketsMinted);
    case "agentShareMints":
      return fmtProofInt(proof.game.agentShareTokensMinted);
    case "waitlist":
      return fmtProofInt(proof.community.waitlist);
    case "culturePoints":
      return fmtProofInt(proof.game.culturePointsNet);
    case "activity24h":
      return fmtProofInt(proof.game.activity24h);
    case "marketplaceListings":
      return fmtProofInt(proof.market.activeListings);
    case "verifiedSocialLinks":
      return fmtProofInt(proof.social.verifiedLinkedAccounts);
    case "packPurchases":
      return fmtProofInt(proof.commerce.packPurchases);
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}

export function proofSignalHref(
  key: ProofSignalKey,
  proof: PublicProofStats | undefined,
): string | undefined {
  if (!proof) return undefined;
  switch (key) {
    case "members":
    case "membersWithWallet":
    case "membersWithFarcaster":
    case "waitlist":
    case "culturePoints":
    case "activity24h":
    case "marketplaceListings":
    case "verifiedSocialLinks":
    case "packPurchases":
      return proof.proofUrls.traction;
    case "bccHolders":
      return proof.proofUrls.blockscoutToken;
    case "bccPrice":
    case "bccMarketCap":
    case "bccLiquidity":
    case "bccVolume24h":
      return proof.proofUrls.dexScreener;
    case "raffleTickets":
    case "agentShareMints":
      return proof.proofUrls.basescanToken;
    default: {
      const _exhaustive: never = key;
      return _exhaustive;
    }
  }
}
