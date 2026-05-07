import { agentShareCampaignAbi } from "@bc/contracts-sdk";
import type { Address, TransactionReceipt } from "viem";
import { decodeEventLog } from "viem";

export function parseMintedTokenIdFromReceipt(
  receipt: TransactionReceipt,
  campaign: Address,
  minter: Address,
): bigint | null {
  const c = campaign.toLowerCase();
  const m = minter.toLowerCase();
  for (const log of receipt.logs) {
    if (!log.address || log.address.toLowerCase() !== c) continue;
    try {
      const ev = decodeEventLog({
        abi: agentShareCampaignAbi,
        data: log.data,
        topics: log.topics,
        strict: false,
      });
      if (ev.eventName !== "Minted") continue;
      const args = ev.args as { to?: Address; tokenId?: bigint };
      if (args.to?.toLowerCase() === m && args.tokenId !== undefined) {
        return args.tokenId;
      }
    } catch {
      /* not our event */
    }
  }
  return null;
}
