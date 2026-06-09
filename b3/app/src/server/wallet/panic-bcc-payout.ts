import type { Address } from "viem";
import { trySendBccFromTreasury } from "@/server/wallet/bcc-treasury-transfer";

type PanicBccPayoutResult =
  | { ok: false; mode: "disabled" | "not_configured" | "failed"; error: string }
  | {
      ok: true;
      mode: "onchain";
      txHash: `0x${string}`;
      chainId: number;
      tokenAddress: Address;
      from: Address;
    };

export async function trySendPanicBccReward(input: {
  to: Address;
  amountWei: bigint;
}): Promise<PanicBccPayoutResult> {
  return trySendBccFromTreasury({
    to: input.to,
    amountWei: input.amountWei,
    memo: "panic_switch_bcc_reward",
  });
}
