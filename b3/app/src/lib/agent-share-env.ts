import type { Address } from "viem";
import { resolveAgentShareCampaignAddress } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

export function getAgentShareCampaignAddress(): Address | undefined {
  return resolveAgentShareCampaignAddress(getDefaultChain().id, env());
}
