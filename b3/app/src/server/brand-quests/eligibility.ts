import { brandQuestEligible } from "@/lib/brand-quest-config";
import { readWalletBccBalanceWei } from "@/server/wallet/bcc-payment-verify";

export async function getBrandQuestEligibility(address: `0x${string}`) {
  const balanceWei = await readWalletBccBalanceWei(address);
  return {
    balanceWei: balanceWei.toString(),
    eligible: brandQuestEligible(balanceWei),
  };
}
