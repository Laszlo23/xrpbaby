import { fmtProofInt } from "@/lib/public-proof-format";
import { proofSignalValue, type ProofSignalKey } from "@/lib/proof-signals";
import type { PublicProofStats } from "@/server/public/proof";

/** Default marketing floor when a key has no bespoke target. */
export const LANDING_STAT_FLOOR = 333;

/** Per-metric founding-phase display targets — avoids every stat reading "333+". */
export const LANDING_STAT_DISPLAY_FLOORS: Partial<Record<ProofSignalKey, number>> = {
  members: 333,
  waitlist: 412,
  membersWithWallet: 127,
  activity24h: 89,
  culturePoints: 2450,
  verifiedSocialLinks: 56,
};

const LANDING_STAT_KEYS_WITH_FLOOR = new Set<ProofSignalKey>(
  Object.keys(LANDING_STAT_DISPLAY_FLOORS) as ProofSignalKey[],
);

const LANDING_PROOF_LABELS: Partial<Record<ProofSignalKey, string>> = {
  members: "Founding Members",
  waitlist: "Early Builders",
  membersWithWallet: "Active Contributors",
  activity24h: "Onchain Actions (24h)",
  culturePoints: "Reputation Points",
  verifiedSocialLinks: "Verified Social Links",
  raffleTickets: "Campaign Tickets",
  agentShareMints: "Grant Milestones",
  bccHolders: "$BCC Holders",
};

export type LandingProofDisplay = {
  value: number;
  suffix: "+" | "";
  loading: boolean;
};

function proofRawInt(key: ProofSignalKey, proof: PublicProofStats): number | null {
  switch (key) {
    case "members":
      return proof.community.members;
    case "membersWithWallet":
      return proof.community.membersWithWallet;
    case "membersWithFarcaster":
      return proof.community.membersWithFarcaster;
    case "waitlist":
      return proof.community.waitlist;
    case "culturePoints":
      return proof.game.culturePointsNet;
    case "activity24h":
      return proof.game.activity24h;
    case "verifiedSocialLinks":
      return proof.social.verifiedLinkedAccounts;
    case "packPurchases":
      return proof.commerce.packPurchases;
    case "raffleTickets":
      return proof.game.raffleTicketsMinted;
    case "agentShareMints":
      return proof.game.agentShareTokensMinted;
    case "marketplaceListings":
      return proof.market.activeListings;
    case "bccHolders":
      return proof.bcc.holders;
    default:
      return null;
  }
}

function displayFloorFor(key: ProofSignalKey): number | undefined {
  return LANDING_STAT_DISPLAY_FLOORS[key] ?? undefined;
}

export function landingProofLabel(key: ProofSignalKey, fallbackLabel: string): string {
  return LANDING_PROOF_LABELS[key] ?? fallbackLabel;
}

export function landingProofDisplay(
  key: ProofSignalKey,
  proof: PublicProofStats | undefined,
  loading: boolean,
): LandingProofDisplay {
  if (loading || !proof) {
    return { value: 0, suffix: "", loading: true };
  }

  const floor = displayFloorFor(key);
  if (floor != null && LANDING_STAT_KEYS_WITH_FLOOR.has(key)) {
    const raw = proofRawInt(key, proof);
    if (raw != null && raw >= floor) {
      return { value: raw, suffix: "", loading: false };
    }
    return { value: floor, suffix: "+", loading: false };
  }

  const raw = proofRawInt(key, proof);
  if (raw != null) {
    return { value: raw, suffix: "", loading: false };
  }

  const parsed = Number(proofSignalValue(key, proof, false).replace(/[^\d.]/g, ""));
  if (Number.isFinite(parsed) && parsed > 0) {
    return { value: Math.round(parsed), suffix: "", loading: false };
  }

  return { value: 0, suffix: "", loading: false };
}

export function landingProofValue(
  key: ProofSignalKey,
  proof: PublicProofStats | undefined,
  loading: boolean,
): string {
  if (loading || !proof) return "…";

  const display = landingProofDisplay(key, proof, false);
  if (display.value <= 0 && !LANDING_STAT_KEYS_WITH_FLOOR.has(key)) {
    return proofSignalValue(key, proof, false);
  }

  return `${fmtProofInt(display.value)}${display.suffix}`;
}
