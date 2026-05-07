import type { Address } from "viem";
import { resolveRaffleCampaignAddress } from "@bc/contracts-sdk";
import { getDefaultChain } from "@/lib/chains";

function env(): Record<string, string | undefined> {
  return import.meta.env as Record<string, string | undefined>;
}

/** Deployed `RaffleTicketCampaign`; unset = demo UI without chain reads. */
export function getCampaignAddress(): Address | undefined {
  return resolveRaffleCampaignAddress(getDefaultChain().id, env());
}

/** Block when campaign was deployed — avoids scanning from genesis in `getLogs`. */
export function getCampaignFromBlock(): bigint {
  const raw = import.meta.env.VITE_CAMPAIGN_FROM_BLOCK as string | undefined;
  if (!raw) return 0n;
  try {
    return BigInt(raw);
  } catch {
    return 0n;
  }
}
