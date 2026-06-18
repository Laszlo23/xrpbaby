import { BCC_AGENT_ACCESS_MIN_WEI } from "@/lib/grant-agent-config";

export type AgentAccessTier = "full" | "paid_only" | "locked";

export function agentAccessFromBccBalance(balanceWei: bigint): AgentAccessTier {
  if (balanceWei >= BCC_AGENT_ACCESS_MIN_WEI) return "full";
  if (balanceWei > 0n) return "paid_only";
  return "locked";
}

export function agentAccessLabel(tier: AgentAccessTier): string {
  switch (tier) {
    case "full":
      return "Premium access — BCC balance unlocked agents";
    case "paid_only":
      return "Pay per call with BCC until you reach 25 BCC balance";
    case "locked":
      return "Earn BCC from quests to unlock agents";
    default: {
      const _exhaustive: never = tier;
      return _exhaustive;
    }
  }
}
