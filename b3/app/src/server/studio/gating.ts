import type { Member } from "@prisma/client";

/** Joined members with a wallet may use BC Studio (credits + rate limits apply). */
export function memberCanAccessStudio(member: Member): boolean {
  if (!member.walletAddress) return false;
  if (member.intent === "build") return true;
  if (member.intent === "explore" || member.intent === "gather") return true;
  if (member.supporterTier === "founding" || member.supporterTier === "elder") return true;
  return false;
}

export function studioAccessDeniedReason(member: Member): string {
  if (!member.walletAddress) {
    return "Connect your wallet and create your pass at /join before using BC Studio.";
  }
  return "Finish onboarding at /join to unlock BC Studio.";
}
