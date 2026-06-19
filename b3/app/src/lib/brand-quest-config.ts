/** 7,000,000 BCC minimum to create brand storytelling quests. */
export const BCC_BRAND_QUEST_MIN_BCC = 7_000_000;

export const BCC_BRAND_QUEST_MIN_WEI = BigInt(BCC_BRAND_QUEST_MIN_BCC) * 10n ** 18n;

export function brandQuestEligible(balanceWei: bigint): boolean {
  return balanceWei >= BCC_BRAND_QUEST_MIN_WEI;
}

export function formatBrandQuestThreshold(): string {
  return `${BCC_BRAND_QUEST_MIN_BCC.toLocaleString()} BCC`;
}
